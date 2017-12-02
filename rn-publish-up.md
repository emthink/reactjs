## React Native App打包发布及热更新

### iOS App

1. 导出js bundle包和图片资源

   ```shell
   react-native bundle --entry-file index.android.js --bundle-output ./bundle/index.android.bundle --platform android --assets-dest ./bundle --dev false
   ```

2. 将js bundle包和图片资源导入到iOS项目中

   1. 使用XCode，选择assets文件夹与main.jsbundle文件将其拖拽到XCode的项目导航面板中即可。

   2. 然后，修改AppDelegate.m文件：

      ```objective-c
      - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
      {
          
        NSURL *jsCodeLocation;
       //jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
       +jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"index.ios" withExtension:@"jsbundle"];
      #endif
      ...
        return YES;
      }
      ```

3. 发布App

   1. Apple开发者账号
   2. Apple ID
   3. iTunes Connect工具创建应用
   4. 打包应用并通过iTuns Connect提交到App store

### Android App

1. 生成Android签名证书

   发布APK应用需要一个证书用于为APP签名，生成签名证书主要有两种方式：

   1. 使用Android Studio以可视化的方式生成；

   2. 使用终端采用命令行的方式生成；

      使用keytool工具：

      ```shell
      keytool -genkey -v -keystore my-release-key.keystore  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
      ```

      1. -keystore指明证书文件名，后缀为`.keystore`;
      2. -alias 指定别名；
      3. ​

2. 设置gradle变量

   将上一步生成的签名证书拷贝至应用的`android/app`目录下，编辑`~/.gradle/gradle.properties`或`../android/gradle.properties`：

   ```java
   MYAPP_RELEASE_STORE_FILE=your keystore filename  
   MYAPP_RELEASE_KEY_ALIAS=your keystore alias  
   MYAPP_RELEASE_STORE_PASSWORD=your releasestore password    
   MYAPP_RELEASE_KEY_PASSWORD=your releasekey password  
   ```

3. 添加应用签名配置

   编辑` android/app/build.gradle`文件添加如下代码：

   ```java
   ...  
   android {  
       ...  
       defaultConfig { ... }  
       signingConfigs {  
           release {  
               storeFile file(MYAPP_RELEASE_STORE_FILE)  
               storePassword MYAPP_RELEASE_STORE_PASSWORD  
               keyAlias MYAPP_RELEASE_KEY_ALIAS  
               keyPassword MYAPP_RELEASE_KEY_PASSWORD  
           }  
       }  
       buildTypes {  
           release {  
               ...  
               signingConfig signingConfigs.release  
           }  
       }  
   }  
   ...  
   ```

4. 签名打包APP

   命令行进入项目下`android`目录，执行指令：`./gradlew assembleRelease`，签名打包成功后你会在 `android/app/build/outputs/apk/`目录下看到签名成功后的`app-release.apk`文件。

   *若需要混淆打包apk，则编辑`android/app/build.gradle`文件：*

   ```java
   **     
    * Run Proguard to shrink the Java bytecode in release builds.  
    */  
   def enableProguardInReleaseBuilds = true  
   ```

5. 上传APP至各大应用商店

## Hot Update

### What

所谓热更新就是在**不重新下载安装应用**的前提下进行代码和资源的更新。

### Why

RN是使用JavaScrip脚本语言编写的，所谓脚本语言就是不需要编译就可以运行的语言，也就是“即读即运行”。每次应用执行前更新脚本，运行时执行的便是新的逻辑了。自然，图片资源与脚步一样，都是可以进行热更新的。

### RN 机制

在开发APP时，我们通常会按照最佳实践方式开发编写多个js文件，而打包的时候RN会将所有js文件打包成一个index.android.bundle(或ios下的index.ios.bundle)文件，所有的js代码(包括rn源代码、第三方库、应用业务逻辑代码)均在此文件内。当App启动时会加载此bundle文件，所谓热更新即更新此bundle文件。

```shell
react-native bundle --entry-file index.android.js --bundle-output ./bundle/index.android.bundle --platform android --assets-dest ./bundle --dev false
```

1. —entry指明入口js文件，android平台是index.android.js，ios平台是index.ios.js；
2. --bundle-output指明RN打包生成的bundle文件输出路径；
3. --platform指明打包生命的平台文件类型；
4. --assets-dest指明图片资源的输出路径；
5. --dev指明是否是开发环境版本。

#### Graph

![](https://github.com/fengjundev/React-Native-Remote-Update/raw/master/image/process.png)

### 实现

1. 检查更新

   ```react
   checkVersion() {  
     if(hasNewVersion()) {  
     	// 有最新版本  
     	Toast.makeText(this, "开始下载", Toast.LENGTH_SHORT).show();  
     	downLoadBundle();  
     }  
   }
   ```

2. 下载新bundle文件

   ```react
   import FileTransfer from 'react-native-file-transfer';

   let fileTransfer = new FileTransfer();
   // url：获取新版本bundle的zip的url地址
   // bundlePath：存放新版本bundle的路径
   // unzipBundle：下载bundle完成后执行的回调方法，这里是解压缩zip
   fileTransfer.download(url, bundlePath, unzipBundle, (err) => {
     	console.log(err);
     }
   );
   ```

3. 解压缩

   ```react
   import Zip from 'react-native-zip';
   import fs from 'react-native-fs';

   function unzipBundle() {
     // zipPath：zip包路径
     // unzipPath：解压输出路径
     Zip.unzip(zipPath, unzipPath, (err)=>{
       if (err) {
         // 解压失败
       } else {
         // 解压成功，将zip包删除
         fs.unlink(zipPath).then(() => {
           // 根据解压得到的补丁文件生成最新版的jsBundle
         });
       }
     });
   }
   ```

4. 更新使用新bundle文件

   RN安装包中的bundle文件默认是在`asset`目录下的，而`asset`目录不提供写权限的，所以不能直接更新安装包中的bundle文件，RN另外提供了修改读取bundle路径的方法，这也是我们能在实践项目中使用热更新的原因。

   ReactActivity类中有`getJSBundleFile`方法：

   ```react
   /**
    * Returns a custom path of the bundle file. This is used in cases the bundle should be loaded
    * from a custom path. By default it is loaded from Android assets, from a path specified
    * by {@link getBundleAssetName}.
    * e.g. "file://sdcard/myapp_cache/index.android.bundle"
    */
   protected @Nullable String getJSBundleFile() {
     return null;
   }
   ```

   此方法返回一个自定义的bundle文件路径，应用启动加载本地bundle时将使用该路径，如果返回默认值null，则会读取`asset`目录下的bundle文件，实现热更新则需要重写此方法：

   ```java
   @Override
   protected @Nullable String getJSBundleFile() {
       String jsBundleFile = getFilesDir().getAbsolutePath() + "/index.android.bundle";
       File file = new File(jsBundleFile);
       return file != null && file.exists() ? jsBundleFile : null;
   }
   ```

   在前面解压缩步骤，将下载的zip包解压到`getFilesDir().getAbsolutePath()`目录下。

   若可写目录下存在bundle，RN则读取此bundle文件；若可写目录下不存在bundle文件，则依然默认返回null，RN依然读取`asset`目录下的bundle文件。

   当再次启动App时，RN将读取可写目录下的bundle文件并执行，后续应用更新步骤依然如上所述。

### CodePush

CodePush 是提供给 React Native 开发者直接部署移动应用更新给用户设备的云服务。CodePush 作为一个中央仓库，开发者可以推送更新 (JS, HTML, CSS and images)，应用可以从客户端 SDK 里面查询更新。CodePush 可以让应用有更多的可确定性，也可以让你直接接触用户群。在修复一些小问题和添加新特性的时候，不需要经过二进制打包，可以直接推送代码进行实时更新。

### Flow

安装CLI -> 注册CodePush -> 注册APP -> APP集成SDK -> 热更新 -> 更新策略 -> 发布更新

#### 更新策略

- 什么时候检查更新？（在APP启动的时候？在设置页面添加一个检查更新按钮？）
- 什么时候可以更新，如何将更新呈现给终端用户？

#### 更新方式

1. 在 js中加载 CodePush模块：
   `import codePush from 'react-native-code-push'`
2. 在 `componentDidMount`中调用 `sync`方法，后台请求更新
   `codePush.sync()`

```react
componentDidMount () {
  AppState.addEventListener("change", (newState) => {
    newState === "active" && codePush.sync();
  });
}
```

