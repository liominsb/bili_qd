import mitt from "mitt";
const emitter = mitt();
//all拿到所有绑定事件，emit触发某一个绑定事件，off解绑某一个事件，on绑定某一个事件
emitter.on("test", () => { console.log("test"); });
emitter.emit("test");
console.log(emitter.all);
emitter.off("test");
emitter.all.clear()//全部解绑
export default emitter;