//扫描模板中所有依赖创建更新函数和watcher
class compile{
    //el是宿主元素
    //lm是Lvue的实例 (*^_^*)
    constructor(el,lm){
        this.$lm = lm;
        this.$el = document.querySelector(el) //默认为选择器
        if(this.$el){
            //将dom节点转换为fragment
            this.$fragment = this.node2Fragment(this.$el);
            //执行编译
            this.compile(this.$fragment);
            //编译后的fragment放回宿主元素
            this.$el = this.$el.appendChild(this.$fragment);
        }
    };
    node2Fragment(el){
        const fragment = document.createDocumentFragment();
        let child;
        while((child = el.firstChild)){
            //appendChild是移动操作
            fragment.appendChild(child)
        }
        return fragment;
    };
    //编译指定片段
    compile(el){
        let childNodes = el.childNodes;
        Array.from(childNodes).forEach((node)=>{
            //判断node类型，做响应处理
            if(this.isElementNode(node)){
                //主要识别l--xx 或 @xx
                this.compileElement(node);
            }else if(this.isTextNode(node) && /\{\{(.*)\}\}/.test(node.textContent)){
                //文本节点 只关心{{xx}}类型
                this.compileText(node,RegExp.$1) //RegExp.$1： 指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串 这边就是*
            }
            //遍历可能存在的子节点
            if(node.childNodes && node.childNodes.length>0){
                this.compile(node);
            }
        })
    };
    //判断元素
    isElementNode(node){
        return node.nodeType ===1  //为元素节点
    }
    //判断文本
    isTextNode(node){
        return node.nodeType ===3  //为文本节点
    }
    //编译元素
    compileElement(node){
        // l-text
        
        const attrs = node.attributes;
        Array.from(attrs).forEach((attr)=>{
            const attrName = attr.name //属性名称 v-text
            const attrValue = attr.value //属性值 abc
            if(this.isDirective(attrName)){
                let dir = attrName.split('-')[1];
                this[dir] && this[dir](node,this.$lm,attrValue);
            }else if(this.isEvent(attrName)){
                let dir = attrName.split('@')[1];
                this.eventHandler(node,this.$lm,attrValue,dir)
            }
        })
    };
    //编译文本
    compileText(node,exp){
        this.text(node,this.$lm,exp)
    };
    //判断指令
    isDirective(attr){
        return attr.indexOf('l-') === 0;
    };
    //判断事件
    isEvent(attr){
        return attr.indexOf('@') === 0;
    };
    //处理文本
    text(node,lm,value){
        this.update(node,lm,value,'text')
    };
    //处理Html
    html(node,lm,value){
        this.update(node,lm,value,'html')
    };
    //双向绑定
    model(node,lm,value){
        this.update(node,lm,value,'model');
        const val = lm.value;
        node.addEventListener('input',e=>{
            lm[value] = e.target.value;
        })
    };
    //处理事件
    eventHandler(node,lm,eventValue,eventName){
        let fn = lm.$opations.methods && lm.$opations.methods[eventValue];
        if(fn && eventName){
            node.addEventListener(eventName,fn.bind(lm))
        }
    };
    //更新函数
    update(node,lm,value,dir){
        let updaterFn = this[dir+'Updator'];
        updaterFn && updaterFn(node,lm[value]); //执行更新
        new watcher(lm,value,function(value){
            updaterFn && updaterFn(node,value); 
        }) 
    };
    textUpdator(node,value){    
        node.textContent = value;
    };
    htmlUpdator(node,value){
        node.innerHTML = value;
    }
    modelUpdator(node,value){
        node.value = value;
    }
}