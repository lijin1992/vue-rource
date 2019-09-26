class Lvue{
    constructor(opations){
        this.$data = opations.data; //保存数据
        this.$opations = opations;
        this.observe(this.$data); //执行响应式
        new compile(opations.el,this)
    };
    observe(value){
        if(!value || typeof value!=='object'){
            return
        }
        //遍历data选项
        Object.keys(value).forEach((v)=>{
            //为每一个Key定义getter和setter
            this.defineReactive(value,v,value[v]);
            this.proxyData(v);
        });
    }
    defineReactive(obj,key,value){
        this.observe(value)  //递归设置数据
        const dep = new Dep();
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get:function(){
                Dep.target && dep.addWatch(Dep.target)
                return value;
            },
            set:function(newValue){
                if(newValue!==value){
                    value = newValue;
                    dep.notify();
                }
            },
        })
    };
    proxyData(key){
        Object.defineProperty(this,key,{
            get(){
                return this.$data[key];
            },
            set(newValue){
                this.$data[key] = newValue;
            }
        })
    }
};
//依赖管理器:负责将视图中所有依赖收集管理，包括依赖添加和通知
class Dep{
    constructor(){
        this.deps = []; //deps中存放所有的观察者watcher
    }
    addWatch(watch){
        this.deps.push(watch)
    };
    //通知所有watch进行更新操作
    notify(){
        this.deps.forEach((watch)=>{
            watch.update();
        })
    };
}
//watcher 具体的更新执行者
class watcher{
    constructor(lm,key,fn){
        //当new一个watcher时，将当前watcher实例附加到Dep.target上
        this.lm = lm;
        this.key = key;
        this.fn = fn;
        Dep.target = this;
        this.lm[this.key];
        Dep.target = null;
    };
    //更新方法
    update(){
        this.fn.call(this.lm,this.lm[this.key]);
    };
}