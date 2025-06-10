export const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  if (!emailRegex.test(value)) {
    callback(new Error("请输入正确的邮箱格式"));
  } else if (!value.endsWith(".edu.cn")) {
    callback(new Error("请输入完整的校园邮箱"));
  } else {
    callback();
  }
}

export const validatePhone = (rule, value, callback) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    callback(new Error("请输入正确的手机号码"));
  } else {
    callback();
  }
}