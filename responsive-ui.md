# 浅谈响应式Web设计与实现思路

是否还在为你的应用程序适配PC端，移动端，平板而苦苦思索呢，是否在寻找如何一套代码适配多终端方式呢，是否希望快速上手实现你的跨终端应用程序呢，是的话，那就看过来吧，本文阐述响应式UI设计相关理论基础，包括：屏幕尺寸，物理，设备独立，CSS像素，dpr，视口等相关概念，还有响应式设计基础，常见设计模式，及响应式UI实现基本思路，希望能加深对响应式的理解和实践思路。

[TOC]

## 响应式（Responsive）

响应式是什么呢？顾名思义，响应式，肯定会自动响应，响应什么？应用程序是在终端屏幕窗口中展示给用户，被用户访问的，那么就是响应屏幕的变化，不同终端屏幕尺寸大小不一致，需要针对不同尺寸屏幕进行不同的展示响应。

> **响应式（Responsive web design, RWD）**，是指一套应用程序用户界面（User Interface）能自动响应不同设备窗口或屏幕尺寸（screen size）并且内容，布局渲染表现良好。

###自适应（Adaptive） 

在响应式设计（RWD）之外，还有一种适配多设备屏幕的方式，**自适应设计（Adaptive web design， AWD）**。

> 自适应设计(AWD)，是指一个应用程序使用多版本用户界面，针对不同设备屏幕，服务器端返回不同版本用户界面，供用户访问。

### 自适应vs响应式

自适应和响应式设计的不同主要概括如下：

1. 自适应是多套用户界面，而后者则只有一套用户界面；
2. 自适应需要服务端检测请求设备分辨率相关信息，然后选择对应版本返回；
3. 自适应可以在不同版本使用不同适配方案，如在PC端使用百分比，在移动端使用rem等，而响应式则需要一个完美兼容的适配方案；
4. 以头条网站为例，访问`www.toutiao.com`PC端会打开PC版本web应用，而在移动端打开，则服务端会重定向至`m.toutiao.com`，对应的返回的就是移动端版本web应用；

自然的，我们本篇要关注的自然是响应式用户界面设计，即一套应用程序适配多设备。

### 移动优先（Mobile first）

从2014年开始，移动设备使用访问率已经超过PC，所以在设计响应式页面程序时，通常都是移动优先，即先适配移动样式和布局，然后再调整适配PC端。

### 渐进增强（Progress enhancement）

另外我们知道移动设备众多，一些低版本或旧系统的设备并不支持JavaScript或CSS的新特性，如es6，media query等，所以通常实现一个基础版本，在大部分设备能满足基本功能后，针对性兼容的添加新功能，新特性，逐步拓展应用，这就是渐进增强。

## 屏幕（screen）

前面讲响应式就是响应屏幕尺寸，那么屏幕尺寸如何衡量呢？主要从尺寸单位，设备独立像素和像素密度等角度考虑。

### 物理尺寸（Display size ／Physical size）

屏幕物理尺寸，指根据屏幕对角线（diagonal）测量的实际物理尺寸，就像我们通常说的屏幕是多少寸的，是5.1还是5.5，平板是10.1，电视是42还是37寸，这里的寸都指（英寸），而且是以对角线长度计量的。

对角线长度，则可以根据三角公式，由宽和高计算得出：

![Physical-screen-size](http://blog.codingplayboy.com/wp-content/uploads/2018/01/physical-screen-size.png)



### 逻辑尺寸（Logic size ／Display resolution）

和屏幕物理尺寸相对的则有逻辑尺寸概念，或者叫它展示分辨率（resolution），而和物理尺寸以长度inch为单位不同，逻辑尺寸则以像素（pixel）为单位计量。

#### Dimension

和物理尺寸以对角线为方向计量屏幕大小不同的是，逻辑尺寸分别从横向（宽），纵向（高）两个方向表示屏幕的尺寸：width，height。以一台`“1024 × 768”`分辨率的笔记本为例，这表示设备屏幕的宽是1024像素，高为768像素。

### 物理像素（device pixel）

物理像素，也叫**设备像素**，**实际像素**，在计算机数字图像中，一个像素（pixel）或一个点（dot）是在一个光栅图片（raster image）中的一个物理点，它是图像在屏幕上展示的的最小可控制元素。

> 所谓的光栅（raster image）或位图（bitmapped image）图片，是指将图像定义为由点（或像素）组成，每个点（或像素）可以由多种色彩表示，包括2、4、8、16、24和32位色彩。例如，一幅1024×768分辨率的32位彩色图片，其所占存储字节数为：`1024×768×32/(8*1024)=3072KB`(一字节等于8位)。

![BitMapped Image](http://blog.codingplayboy.com/wp-content/uploads/2018/01/intro-pixel-example.png)

如图，将屏幕放大至一定程度，可以看见是由很多个点（或像素）组成，屏幕上的这些一个一个的点（或像素）就是我们说的**物理像素**，而像素数量的不同及每个像素的不同色彩表示就构成图像展示，决定它的视觉表现。

### CSS像素（CSS Pixel）

除了前面介绍的物理像素，还有一种像素经常被提及，那就是CSS像素，也作**逻辑像素**，**虚拟像素**，它仅仅是描述图像单元信息的概念，通常描述图像中某一个小方框所需要展示的颜色值，而这一些列方框点合起来就能描述一幅图像，web编程中用来度量网页内容尺寸或位置的就是这个**抽象单位**。

![logical pixel](http://blog.codingplayboy.com/wp-content/uploads/2018/01/logical-pixel.png)

### 分辨率（resolution）

分辨率通厂都是指设备分辨率，即设备屏幕上显示的物理像素总和，以一台`“1024 × 768”`分辨率的笔记本为例，这表示设备屏幕的宽是1024物理像素，高为768物理像素，它展示的像素总数就是`1024*768`。

### 像素密度（Pixel density）

屏幕上每英寸（PPI，Pixel per inch）或每厘米（PPCM，Pixel per centimeter）上拥有的**物理像素**（或点）的数量，称为**像素密度**，也作**屏幕密度**，计算公式为：

```javascript
pixel density(pd) =  屏幕宽度物理像素 ／ 屏幕宽度英寸；
```

如一个15英寸（对角线）大小的设备，有一个12英寸宽，9英寸高的屏幕，并且其分辨率为`1024*768`像素，则其像素密度则大概为85PPI：

```javascript
pd = 1024 ／ 12 ～= 768 ／ 9 ～= 85PPI
```

当然横纵方向上的像素密度并不总是相同的，如将上面例子的分辨率改为`1280×1024`，则：

1. 横向：`pd = 1280 / 12 ~=107PPI`;
2. 纵向：`pd = 1024 / 9 ~= 114PPI`;

#### 分辨率转换为像素密度

根据屏幕分辨率计算得出像素密度公式，如：
$$
d_{p}={\sqrt  {w_{p}^{2}+h_{p}^{2}}}
$$

$$
V_{pd}={\frac  {d_{p}}{di}}PPI
$$

1. `w<sub>p</sub>`：分辨率横向像素数；
2. `h<sub>p</sub>`：分辨率纵向像素数；
3. `d<sub>p</sub>`：对角线分辨率像素数；
4. `di`：对角线物理尺寸（inch）；
5. `V<sub>pd</sub>`：像素密度，单位为PPI；

#### 密度等级划分 

为简便起见，Android 将所有屏幕密度分组为六种通用密度： 低、中、高、超高、超超高和超超超高。而低密度屏幕在给定物理区域的物理像素少于高密度屏幕。

#### 点密度（dots per inch）

另外我们可能还听过点密度（dots per inch，dpi），它和前面介绍的像素密度相似，通常可以交叉使用，只是描述领域不同，像素（pixel）通常在计算机视觉显示领域使用，而点（dot）则主要在打印或印刷领域中使用。

### 设备独立像素（dp／dip）

设备独立像素（device independent pixel，称为dp或dip），也叫**密度无关像素**，是基于屏幕物理密度的抽象单位。首先由Google提出适配众多Android设备屏幕的抽象单位。在定义 UI 布局时可以使用的**虚拟像素**单位，表示布局维度或位置。

> 它是一个基于计算机坐标系统的物理度量单位，并且可以将物理像素抽象为**虚拟像素**以便在应用中使用，然后计算机内部系统可以将应用中使用的虚拟像素转换为**实际物理像素**。

这中抽象使得移动设备可以在不同屏幕缩放展示信息和用户交互界面，而内部图像系统可以将应用中的抽象像素度量转换为实际像素度量，因此应用可以直接使用抽象像素，而不用编码处理大量的物理像素差异化的设备。通常，安卓设备假设“中等”密度屏幕设备独立像素基准为：

```
一个设备独立像素（dp／dip）等于160 dpi（或PPI） 屏幕上的一个物理像素，即等于1 / 160英寸。
```

而windows则定义一个设备独立像素为96dpi屏幕上的一个物理像素，即1dp等于1 ／ 96英寸；Apple系统则默认一个设备独立像素为72dpi屏幕上的一个物理像素。系统运行时，根据当前屏幕的实际密度以透明方式处理 dp 单位的任何缩放 。

#### 计算设备独立像素

如何计算某一设备的设备独立像素呢？根据上面介绍可以得到dp和inch的如下等式：	
$$
1dp={\frac {1}{ratio}}inch
$$

1. `*ratio*`：即设备系统指定的默认比例;
2. `inch`：物理尺寸，英寸；

所以可以得到dp和物理像素的转换关系：
$$
1dp={\frac {V_{pd}}{ratio}}(PPI*inch)={\frac {V_{pd}}{ratio}}pixel
$$

1. `V<sub>pd</sub>`：设备像素密度；
2. `PPI*inch`：`pixel/inch * inch = pixel`;

如，当屏幕密度为240dpi（或PPI），即`V<sub>pd</sub> = 240`时，1 dip 则等于1.5个物理像素（pixel）。

### 设备像素比（dpr）

关于物理像素，设备独立像素或CSS像素，有一个很常见的概念，设备像素比（device pixel ratio，dpr），它描述的是使用多少实际像素渲染一个设备独立像素，它的计算方式为：
$$
dpr={\frac {N_{dp}}{N_{px}}}
$$

1. `N<sub>dp</sub>`: 设备屏幕实际像素数；
2. `N<sub>px</sub>`: 屏幕设备独立像素数（PC端通常等于CSS像素数）；
3. `dpr`：设备像素比；

在浏览器中，我们可以使用`window.devicePixelRatio`获取其dpr值，dpr更高的设备屏幕会使用更多物理像素展示一个设备独立像素，所以其效果更细腻，更精致。如在一个dpr=2的设备上，1个设备独立像素需要使用4个物理像素展示，因为宽高各为2倍。

### 设备独立像素与CSS像素

上一小节介绍的设备像素比（dpr），通常指物理像素和设备独立像素的比例，我们知道，CSS像素最终是需要转换为物理像素展示的，那么CSS像素如何对应物理像素呢？

1. 根据前文设备独立像素小节所介绍，在具体设备上，设备独立像素与物理像素的比例是固定的；
2. 在PC端，通常设备独立像素和CSS像素比例是1:1，CSS像素能以正常比例转换为物理像素展示；
3. 在移动端，为了更好的展现页面，默认情况下会进行缩放，这时设备独立像素和CSS像素比例并不是1:1，所以CSS像素与物理像素的比例就变了，所以我们看到的效果就变了；
4. 当我们使用viewport meta明确设置视口`width`为理想视口时，视口宽度单位为设备独立像素，同时设置`intial-scale=1.0`即表明将CSS像素和设备独立像素比例设置为1.0，那么CSS像素到物理像素的转换就能很好的展现我们的UI了。

### UI度量（UI Dimension）

计量屏幕或屏幕内某一区域大小时，我们可以说长，宽多少寸，但是寸只是一个物理长度概念，而在开发UI界面时，由于需要适配诸多不同设备，所以可衡量，可比较的UI度量则需要使用数字加抽象计量单位，我们可以称之为UI维度（UI Dimension）。

> A dimension is specified with a number followed by a unit of measure
>
> 维度使用一个数字加上一个度量单位声明，如100px，10pt，10in，10dp等。

#### 英寸（in）

Inches - Based on the physical size of the screen.

基于屏幕物理尺寸的度量单位，`in`。

#### UI像素（px）

UI像素px，是一个相对单位，与之相对的是设备像素（device pixels）。一个px在不同设备上可能对应不同的物理像素数或（点），这取决于设备像素比（device pixel ratio）。开发页面时，经常使用该单位定义UI的布局和内容尺寸，文字大小，可以在浏览器中实现像素展示良好的UI界面。

但是由于不同设备上使用px单位时不会根据设备屏幕大小进行自适应，尤其是PC和移动端差别比较大，所以一般响应式界面较少用px单位。

#### 磅（pt）

磅，pt，即point，是印刷行业常用单位，等于1/72英寸，它是长度单位，是绝对大小，而px则是相对大小。

#### px与pt

前面说了，px是相对大小，pt是绝对大小，所以在不同设备上，他们的关系可能不同，以Android设备为例，`一个dp等于160dpi屏幕上的一个物理像素`，则：

````
1dp = 1 ／ 160 inch
````

而结合前面介绍的pt单位：

```
1pt = 1 / 72 inch 
```

对于240PPI的屏幕，则：

1. `1dp = 1 / 160 inch = 240 / 160 px = 1.5物理像素`；
2. `1px = 1 / 240 inch `；
3. `1pt = 0.35物理像素 = 0.35 / dpr CSS像素(px)`；

#### em

em是在web文档中使用的一个缩放单位，1em等于最近父元素的`font-size`字体尺寸，如最近父元素字体为14pt，则`1em=14pt`。使用em单位表示的尺寸可以较好的在多终端浏览器进行样式适配。

#### rem

rem也是一个缩放单位，与em相似，都是基于字体尺寸，不同的是rem是基于文档根元素字体尺寸，而与父元素字体尺寸无关，如文档根元素`<html>`font-size属性为12pt，而最近父元素字体为14pt，则`1rem=12pt`。

由于rem基于根元素字体大小计算，所以在文档中，任何一处使用rem单位计算基准都一样，使得尺寸计算得到统一，而前面的em则在文档中都是基于最近父元素`font-size`属性值，这说明在`font-size`值不同的父元素中使用em单位，计算并不能统一，这也是为什么在目前的PC，移动端多设备适配方案中，rem比em更常见。

#### 百分比（%）

还有一个%百分比单位，基于最近父元素的相关属性尺寸，乘以分配的百分比数，如父元素width为10pt，font-size：14pt，则width：10%就是1pt，font-size: 110%为15.4pt（浏览器实际渲染会化为整数渲染）。特别注意的是`margin,padding`属性值为百分比时，是基于当前元素width值的。

%单位也是一个缩放单位，所以也常用于样式适配。

## 视口（viewport）

在实现响应式设计之前，我们还需要了解一些视口相关概念。

**视口(viewport）**，即可视区域的大小，指浏览器窗口内的内容区域，不包含工具栏、标签栏等，也就是网页实际显示的区域。

### 视口类型

在开发移动端wap应用时，为了开发体验更友好的界面，需要了解更多视口相关概念，通常将视口分为三种：视觉视口，布局视口，理想视口。

#### 视觉视口（visual viewport）

visual viewport定义如：

> The visual viewport is the part of the page that’s currently shown on screen. The user may scroll to change the part of the page he sees, or zoom to change the size of the visual viewport。
>
> 视觉视口是指当前屏幕上页面的可见区域。用户可以滚动来改变当前页面可见部分，或者缩放来改变视觉视口的尺寸。

visual viewport默认可以通过`window.innerWidth`来获取，另外用户可以通过缩放来改变visual viewport的尺寸，缩小时，visual viewport值变大，放大时，visual viewport值变小。

在目前新的[草案文档](https://wicg.github.io/visual-viewport/index.html)中，已经定义了`window.visualViewport`API可以获取视觉窗口对象，在Chrome61以上即可访问：

```javascript
console.log(window.visualViewport.width);
```

`window.visualViewport`对象属性如：

| `visualViewport` 属性 | 说明                                       |
| ------------------- | ---------------------------------------- |
| `offsetLeft`        | 视觉视口与布局视口左边界的间距以CSS pixels表示；            |
| `offsetTop`         | 视觉视口与布局视口上边界的间距以CSS pixels表示；            |
| `pageLeft`          | 视觉视口左边界和文档左边线的偏移距离，以CSS pixels表示；        |
| `pageTop`           | 视觉视口上边界和文档上边线的偏移距离，以CSS pixels表示；        |
| `width`             | 视觉视口的宽度，以CSS pixels表示；                   |
| `height`            | 视觉视口的高度，以CSS pixels表示；                   |
| `scale`             | 缩放比例，比如文档被放大2被，则返回值 `2`. 这个值不受设备像素比`devicePixelRatio`的影响。 |

#### 布局视口（layout viewport）

layout viewport的定义如下：

> In the CSS layout, especially percentual widths, are calculated relative to the layout viewport, which is considerably wider than the visual viewport.
>
> 在CSS布局中，比如百分比宽度是相对于布局视口来计算的，布局视口通常比视觉视口宽。

layout viewport宽度可以通过`document.documenElement.clientWidth`或`document.body.clientWidth`来获取。

为什么说布局视口通常比视觉视口宽呢，看图很容易理解：

![Visual VS Layout Viewport](http://blog.codingplayboy.com/wp-content/uploads/2018/01/visual-layout-viewport.png)

**当给定文档内容宽度大于视觉窗口宽度时，会出现如图情况，视觉视口就是屏幕内文档可见区域，而布局视口则包括文档不可见区域，只有滚动才能查看其内容。**

通常浏览器默认设置布局视口为**980px或1024px**，所以通常你会看到它大于设备屏幕可视区域，尤其是在移动设备上，另外从上面给的多种实例图片可以看出顶部`position:fixed`导航栏，始终跟随布局视口，`width: 100%`对应的是布局视口宽度。

#### 理想视口（ideal viewport）

> 理想视口，是指设备的屏幕尺寸，单位为设备独立像素（虚拟像素，实际会被转换为物理像素展示）。

ideal viewport宽度可以使用`screen.width`来获取，其值是由设备决定，是对设备来说最理想的布局视口尺寸。如，iphone5理想视口为`320`，iphone6为`375`，IPhone7plus为`414`。

**这里设置视口为设备独立像素，那如何与UI使用的CSS像素匹配呢？首先设备独立像素和物理像素的比例在具体某台设备上是固定的，然后我们知道设备独立像素和CSS像素都是虚拟单位，在PC端，通常设备独立像素和CSS像素比例是1:1，CSS像素能以正常比例转换为物理像素展示；但是在移动端，为了更好的展现页面，默认情况下会进行缩放将内容调整为适合屏幕的大小，这时设备独立像素和CSS像素比例并不是1:1，所以CSS像素与物理像素的比例就变了，所以我们看到的效果就变了，当我们使用viewport meta明确设置视口width为理想视口时，视口宽度单位为设备独立像素，同时设置intial-scale=1.0即表明将CSS像素和设备独立像素比例设置为1.0，那么CSS像素到物理像素的转换就能很好的展现我们的UI了。**

### viewport meta

在现在的移动端网页中，我们经常可以看到这么一句代码：

```html
 <meta name="viewport", width=device-width, initial-scale=1.0>
```

`device-width`返回的就是设备的`ideal viewport`宽度，这句代码就是声明当前布局使用设备理想视口宽度，在这种情况下，以iphone6理想视口为`375`为例，html设置`width: 100%`，最终得到的宽度就是`320px`。

对于未设置`meta`元视口代码的页面，在移动端访问时，布局视口为默认值`980px`，文档被缩小以完全展示内容，此时CSS像素与物理像素的比例变大，即一物理像素展示更多CSS像素，展示效果如图：

![blog ui](http://blog.codingplayboy.com/wp-content/uploads/2018/01/mobile-blog-ui.png)

此时`visualViewport`对象信息如下：

![visualViewport](http://blog.codingplayboy.com/wp-content/uploads/2018/01/visual-viewport-object.png)

### 视口与布局

在iphone之前，都是通过调整内容，适配PC端网站使其在手机浏览器上也可以友好访问；后来iphone提出在“虚拟窗口”（视口）上展现网页内容，并提供viewport元信息元素以控制虚拟窗口大小。

在桌面浏览器中，浏览器窗口宽度就是我们CSS布局时，能使用的最大宽度，如果内容宽度超出视口宽度，则会出现滚动条，以查看所有内容；在移动浏览器中则不同，我们可以额外使用viewport控制视口以满足展示需求。

#### 默认布局视口

如下对于一个PC网站，PC端正常展示如下：

![PC Blog](http://blog.codingplayboy.com/wp-content/uploads/2018/01/pc-blog-ui.png)

而在移动端默认情况下，展示如图：

![Mobile Blog](http://blog.codingplayboy.com/wp-content/uploads/2018/01/mobile-blog-ui.png)

1. 我们给文档html，body宽度设置为`width:100%`，所以html，body的宽度是`980px`，这是**浏览器默认设置的布局视口宽度**；

2. 默认，移动端浏览器布局视口为980px，然后根据页面内容进行**缩放**以使页面内容能在当前可视窗口完全展示；当明确设置宽度width时：

   1. 若width大于980：我们设置html等元素`width: 1200px`后，视口将缩小布局以支持更多CSS像素，即一个物理像素将对应更多CSS像素，视觉上看就是页面被缩小了，这也验证了CSS像素只是一个虚拟像素；

      ![Mobile 1200 px](http://blog.codingplayboy.com/wp-content/uploads/2018/01/mobile-1200-width.png)

   2. 若width小于980：我们设置html等元素`width: 400px`后，内容在视口的一部分展示，剩余部分空白，视觉上并没有被缩放，只是在更小的区域展示，导致文本换行，高度增加；

      ![Mobile 400px](http://blog.codingplayboy.com/wp-content/uploads/2018/01/mobile-400-width.png)

*比较特殊的是`position:fixed;`定位的顶部导航栏元素，其始终对应于布局视口。*

#### 添加meta

加入给页面添加元视口代码：

```html
<meta name="viewport" content="width=device-width,initial-scale=1.0>
```

添加如上代码后，明确设置布局视口为理想视口宽度，这样浏览器就能完美展示我们的页面，页面也不会被缩放处理。当然，我们设置元素样式时，其宽度便不能超过该布局视口宽度，对于iphone6，为`375px`；如果超出则会出现滚动条。

![device-width](http://blog.codingplayboy.com/wp-content/uploads/2018/01/blog-viewport-device-width.png)

## 

## CSS3 媒体查询（media query）

CSS3 中的 Media Queries 增加了更多的媒体查询，就像if条件表达式一样，我们可以设置不同类型的媒体条件，并根据对应的条件，给相应符合条件的媒体调用相对应的样式表。如：

1. 视口宽度大于 800px 的纵向显示屏，加载特定css文件：

   ```html
   <link rel="stylesheet" media="screen and (orientation: portrait) and (min-width:
   800px)" href="800wide-portrait-screen.css" />
   ```


2. 打印设备特定css文件：

   ```Html
   <link rel="stylesheet" type="text/css" media="print" href="print.css" />
   ```

3. 视口在375和600之间，设置特定字体大小18px：

   ```css
   @media screen (min-width: 375px) and (max-width: 600px) {
     body {
       font-size: 18px;
     }
   }
   ```

## 响应式实现基础

响应式设计实现通常会从以下几方面思考：

1. 组合流式布局、弹性盒子（包括图片、表格、视频）和媒体查询等技术；
2. 使用百分比布局创建流式布局的弹性UI，同时使用媒体查询限制元素的尺寸和内容变更范围；
3. 使用相对单位使得内容自适应调节；
4. 选择断点，针对不同断点实现不同布局和内容展示；

## 响应式设计模式

目前，响应式设计实践大致可总结为五类：mostly fluid、column drop、layout shifter、tiny tweaks 和 off canvas，通常，我们选择其中的某一种或几种组合实现我们的响应式UI。

### 微调式（Tiny Tweaks）

Tiny Tweaks布局模式主要表现为单一列展示大部分内容，随着视口宽的的增加，改变`font-size`值和`padding`间距，以保证内容的持续可读性。

> 微调式针对单列布局，简单的修改字体大小，padding和margin间距，保证内容可读性。

![Tiny taeaks](http://blog.codingplayboy.com/wp-content/uploads/2018/01/tiny-tweaks-example.png)

```css
.c1 {
  padding: 10px;
  width: 100%;
}

@media (min-width: 600px) {
  .c1 {
    padding: 20px;
    font-size: 1.5rem;
  }
}

@media (min-width: 960px) {
  .c1 {
    padding: 40px;
    font-size: 2rem;
  }
}
```

### 浮动式（Mostly Fluid）

Mostly Fluid布局是一种多列布局，在大屏幕上设置较大`margin`，但是在移动端则会浮动后续列，垂直堆叠排列。该模式很常见，因为通常只需要设置一个断点。

> 浮动式布局，精髓在于浮动，随着屏幕缩小，浮动后续列，通常float／flex + width然后使用media query设置不同width值实现。

![Mostly fluid](http://blog.codingplayboy.com/wp-content/uploads/2018/01/mostly-fluid-example.png)

以如下html结构为例：

```html
<!--Pattern HTML-->
<div id="pattern" class="pattern">
  <div class="c">
    <div class="main">
      <h2>Main Content (1st in source order)</h2>
      <p>1</p>
    </div>
    <div class="c2">
      <h3>Column (2nd in source order)</h3>
      <p>3</p>
    </div>
    <div class="c3">
      <h3>Column (3nd in source order)</h3>
      <p>4.</p>
    </div>
  </div>
</div>
<!--End Pattern HTML-->
```

其样式通常有如下方式：

```css
.main {
  background-color: #8e352e;
}

.c2 {
  background-color: #c84c44;
}

.c3{
  background-color: #a53d36;
}

@media screen and (min-width: 37.5em) {
  .c2, .c3 {
    float: left;
    width: 50%;
  }
}
```

当屏幕宽度大于31.42em，浏览器默认font-size为16px，则为`37.5 * 16 = 600  `px，大于600px像素时下面两个div则浮动并列显示，否则垂直堆叠展示。

### 断列式（Column Drop）

Column Drop也是一种多列布局方式，在移动端垂直堆叠排列，随着屏幕增大将各列平铺排列，这种模式就需要我们选择多个断点并选择变化列。

> 断列士核心是将内容划分为多列，然后随着屏幕变小，依次将左／右列断开堆叠至主列下方。

![Column drop](http://blog.codingplayboy.com/wp-content/uploads/2018/01/column-drop-example.png)

```html
<!--Pattern HTML-->
  <div id="pattern" class="pattern">
    <div class="c">
      <div class="main">
        <h2>Main Content (1st in source order)</h2>
        <p>1</p>
      </div>
            <div class="sb">
                <h3>Column (2nd in source order)</h3>
                <p>2</p>
            </div>
            <div class="sb-2">
                <h3>Column (3nd in source order)</h3>
                <p>3</p>
                
            </div>
        </div>
    </div>
    <!--End Pattern HTML-->
```

样式如：

```css
.main {
  background-color: #8e352e;
}

.sb {
  background-color: #c84c44;
}

.sb-2 {
  background-color: #a53d36;
}
@media screen and (min-width: 42em) {
  .main {
    width: 75%;
    float: left;
    padding: 0 1em 0 0;
  }
  .sb {
    float: left;
    width: 25%;
    
  }
  .sb-2 {
    clear: both;
  }
}
@media screen and (min-width: 62em) {
  .main {
    width: 50%;
    margin-left: 25%;
    padding: 0 1em;
  }
  .sb {
    margin-left: -75%;
  }
  .sb-2 {
    float: right;
    width: 25%;
    clear: none;
  }
}
```

### 移位式（Layout Shifter）

Layout Shifter响应式设计是指针对不同屏幕进行不同布局和内容展示，通常需要设置多个断点，然后针对不同大小屏幕，进行不同设计，和前面几种模式在处理小屏幕时自动将后面列往下堆叠不同，在每类断点之间都需要涉及布局和内容两者的修改；这意味着我们需要做更多的编码工作，当然我们的可控性也更强。

> 移位式核心在于确定不同屏幕需要何种布局及内容展示方式，然后在各断点使用media query进行控制。

![Layout Shifter](http://blog.codingplayboy.com/wp-content/uploads/2018/01/layout-shifter-example.png)

### 分屏式（Off Canvas）

在这之前的四种设计思路都是在大屏铺开展示，然后随着屏幕缩小，将其余列垂直堆叠展示，用户需要上下滚动才能查看页面所有内容，而Off Canvas模式则换了一个思路：分屏：

1. 在小屏幕设备，将不常用或非主要的内容（如导航和菜单之类）放在屏幕外左右两侧，点击可以切换显示／隐藏；
2. 在大屏幕可选择性的铺开展示；

> 分屏式精华是划分主要内容（如文章列表）和非主要内容（如导航栏），然后优先展示主要内容，非主要内容可以在左右两侧隐藏，支持用户主动点击／滑动切换显示／隐藏。

![Off Canvas](http://blog.codingplayboy.com/wp-content/uploads/2018/01/off-canvas-example.png)

通常的做法是，在小屏幕，设置不常用内容`display: none;`或`transform: translate(-200px, 0);`，然后点击打开按钮时，添加恢复样式`display: block;`或`transform: translate(0, 0);`，即可展示；在大屏幕则可选择性设计展示方式，通常是直接平铺。

## 响应式实现

理论知识基本准备的差不多了，接下来实现一个简单的例子。

### 设置视口

在html内添加元视口代码：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

1. `width=device-width` 指定视口为理想视口，以便使用当前视口（设备独立像素为单位）能展现良好的页面；
2. `initial-scale=1` 指定将 CSS 像素与设备独立像素比例设为 1:1。

`intial-scale=1.0` 即阻止移动浏览器自动调整页面大小 ，浏览器将按照视口的实际大小（此处设置为理想视口）来渲染页面。

当然还可以通过CSS@viewport方式声明，与meta标签效果相同：

```css
@viewport {
  width: device-width;
  zoom: 1;
}
```

*其中，zoom属性等同于 viewport meta 标签的 initial-sacale 属性。*

### 媒体查询

当前各主流浏览器基本都支持meida query，但是如果你期望网站在IE8甚至以下版本也展示良好，则需要添加兼容，可以用 media-queries.js 或 respond.js：

```html
<!--[if lt IE 9]>
<script src="//css3-mediaqueries-js.googlecode.com/svn/trunk/css3-mediaqueries.js"></script>
<![endif]-->
```

### 设置断点（breakpoints）

响应式设计还有一个重要的问题是如何确定视图断点，是以设备为依据吗？当然不行，设备是无穷无尽的，最好的实践是以内容为依据，然后从移动设备开始，从小到大依次增加一屏展示内容，确定我们期望的多个视图断点及布对应设计UI。

以material-ui为例，分为：

1. **xs**, extra-small:  > 0
2. **sm**, small:  >= 600
3. **md**, medium:  >= 960
4. **lg**, large:  >= 1280
5. **xl**, xlarge: >= 1920

![Breakpoints](http://blog.codingplayboy.com/wp-content/uploads/2018/01/layout-adaptive-breakpoints-01.png)

可以自由选择断点并使用media query设置响应式布局，如：

```css
/* for 1280px or less */
@media screen and (max-width: 1280px) {
  #pagewrap {
    width: 95%;
  }
  #content {
    width: 65%;
  }
  #sidebar {
    width: 30%;
  }
}
/* for 960px or less */
@media screen and (max-width: 960px) {
  #content {
  	width: auto;
  	float: none;
  }
  #sidebar {
  	width: auto;
  	float: none;
  }
}
 
/* for 600px or less */
@media screen and (max-width: 600px) {
  h1 {
    font-size: 0.8em;
  }
  #sidebar {
    display: none;
  }
}
```

当然这并不意味着我们只能使用这几个断点，也许我们希望在特定情况下，进行一些特定处理：

```css
@media (min-width: 360px) {
  body {
    font-size: 1rem;
  }
}
```

### 相对单位

既然是响应式设计，需要实现响应式视图，那么固定值的长度单位就必然很难满足期望；如果使用固定单位，如`px`，则需要针对每一种情况进行不同处理，多了很多工作，否则就无法实现响应式。

例如，给在容器div设置`width: 100%;`可以确保其填充视口宽度，相对视口而言不会太大也不会太小，无论设备是宽度为320像素的 iPhone5、宽度为375像素的iPhone6，还是宽度为360像素的 Nexus 5，div 均会适应于这些设备屏幕；此外，使用相对单位可以自动调整内容尺寸空间，而不会出现横向滚动条的情况。

```css
.wrap {
  width: 320px;
  font-size: 20px;
}
// 相对单位
.wrap {
  width: 100%;
  font-size: 1.25rem;
}
```

相对单位有百分比（%），em，rem等。

### 响应式文本

针对网站可读性的调研发现，阅读体验友好段落行内应该包含 70 到 100 个字符，通常是8-15个英文单词，20-50个中文汉字，所以需要针对视图断点进行控制：

```css
width: 100%;
padding: 10px;
@media screen (max-width: 600px) {
  .article {
    width: 100%;
    papdding: 15px;
    margin: 0 auto;
    font-size: 1rem;
  }
}

@media screen (min-width: 600px) and (max-width: 960px) {
  .article {
    max-width: 700px;
    margin-left: 0 auto;
  }
}
```

如上，在较小的屏幕上，大小为1rem的字体可以使每行完美地呈现约20-30中文，而在较大的屏幕上就需要添加断点了，如，当浏览器宽度超过 600px，则内容理想宽度是100%，最大理想宽度是700px。

### 响应式图片

因为布局是响应式的，所以图片也需要根据布局进行响应式展现。

#### 弹性图片布局

首先在布局上，我们的图片肯定需要随着布局变更而弹性变化，所以不能设置固定尺寸，通常使用相对单位，设置如下样式：

```css
.img-wrap {
  width: 100%;
}
img { max-width: 100%; }
```

设置宽度100%，宽度自适应，不设置高度，图片高度将按照图片分辨率比例自适应，于是，图片便可以自动跟随容器缩放良好展现。

同时我们也有必要为图片容器设置最大宽度，避免出现图片拉伸过大，损失质量的情况：

```css
.img-wrap {
  max-width: 200px;
}
```

#### 图片响应式

是不是这样就结束了呢？当然不是，通常，PC端需要使用大尺寸图片展现，但是在移动端限于带宽和网络流量原因，必然不适合使用大尺寸图，图片内容也需要响应式，我们应该为不同的屏幕尺寸提供不同的图片，为大屏幕准备大尺寸图片，小屏幕准备尺寸更小的清晰图片，另外高分辨率 (2x, 3x) 显示屏上高分辨率图片可保证清晰度。

![Responsive imgs](http://blog.codingplayboy.com/wp-content/uploads/2018/01/responsive-imgs.png)

##### srcset

`srcset` 属性增强了 `img` 元素的行为，我们可以针对不同设备提供不同尺寸图片。类似于 CSS 原生的 `image-set` [CSS 函数](https://developers.google.com/web/fundamentals/design-and-ux/responsive/images#use-image-set-to-provide-high-res-images)，`srcset` 也允许浏览器自动根据设备特性选择最佳图像，例如，在 2x 显示屏上使用 2x 图像。

```html
<img src="photo.png" srcset="photo@2x.png 2x" />
```

在不支持 `srcset` 的浏览器上，浏览器需使用 `src` 属性指定的默认图像文件，所以需要始终包含一个在任何设备上都能显示的默认图像。如果 `srcset` 受支持，则会在进行任何请求之前对逗号分隔的图片条件列表进行解析，并且只会下载和显示默认图片。

当然该方式目前兼容性实在不乐观，比较少使用。

#### 艺术方向（picture）

艺术方向是指使用 `picture` 元素，根据设备特性选择特定图像。 `picture` 元素支持声明式方式定义，根据设备大小、设备分辨率、屏幕方向等不同特性来提供一个图片的多尺寸版本：

```html
<picture>
  <source media="(max-width: 599px)" srcset="profile-s.png">
  <source media="(min-width: 600px)" srcset="profile-600w.png">
  <img src="profile-600w.png" alt="Progile">
</picture>
```

1. `picture`元素包含了`source`元素列表，浏览器可以根据当前设备特性选择特定源图片，然后需要声明一个`img`元素提供默认图片；
2.  `<source>`元素包含一个`media`属性，该属性是一个媒体条件，根据这个条件决定显示哪张图片，从上至下，遇到匹配条件为真，则显示对应图片。在如上实例，若视口宽度不超过599px，则显示第一个`<source>`元素`srcset`指定的图片，若视窗宽度大于或等于600px，则显示第二张图片；
3. `srcset`属性包含要显示图片的路径。请注意，正如我们在`<img>`上面看到的那样，`<source>`可以使用引用多个图像的`srcset`属性，还有`sizes`属性。所以支持通过一个 `<picture>`元素提供多个图片，也可以给每个图片提供多分辨率的图片，不过通常需求比较少；
4. 最后一点需要注意的是，我们应该总是在 `</picture>`前面提供一个`<img>`元素以及它的`src`和`alt`属性，否则不会有图片显示，并且当媒体条件都不匹配时，会加载`img`提供的图片，；另外，如果浏览器不支持 `<picture>`元素，也会默认使用该`img`元素替换；

更多关于响应式图片信息可以查阅[参考资料](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)。

## 总结

本文主要介绍了响应式设计相关理论基础，包括：屏幕尺寸，物理，CSS像素等相关概念，视口，响应式设计基础，常见设计模式，及响应式UI实现基本思路等，目前最常见的多屏适配rem方式，博主计划后续继续介绍。

## 参考

1. [Responsive Design](https://developer.mozilla.org/en-US/Apps/Progressive/Responsive/responsive_design_building_blocks)
2. [Respinsive Web Design](https://developers.google.com/web/fundamentals/design-and-ux/responsive/)
3. [A tale of two viewports](https://www.quirksmode.org/mobile/viewports.html)
4. [Display Size](https://en.wikipedia.org/wiki/Display_size)
5. [Viewport Meta tag](https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag)