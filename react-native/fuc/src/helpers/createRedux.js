/**
 * @desc [创建redux辅助函数]
 */

/**
 * 
 * @param {String} type action Type
 * @param {Object} extraParams extra params
 */
export const createAction = (type) => {
  return (payload, extraParams = {}) => {
    return {
      type,
      payload,
      ...extraParams
    };
  };
};