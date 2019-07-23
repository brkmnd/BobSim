var Machine = function(){
    var pub = {};
    var memSize = 2000;
    pub.regs = function(){
        var regs = {"spointer":memSize};
        var ret = {};
        ret.read = function(r){
            if(regs[r] === undefined){
                regs[r] = 0;
                }
            return regs[r];
            };
        ret.write = function(r,v){
            regs[r] = v;
            };
        ret.xor = function(r,v){
            regs[r] ^= v;
            };
        ret.foreach = function(f){
            var k = Object.keys(regs);
            for(var i = 0; i < k.length; i++){
                var k0 = k[i];
                f(k0,regs[k0]);
                }
            };
        return ret;
        }();
    pub.mem = function(){
        var mem = {};
        var ret = {};
        ret.read = function(i){
            if(i >= 0 && i < memSize){
                if(mem[i] === undefined){
                    mem[i] = 0;
                    }
                return mem[i];
                }
            pub.fail.segfault = "segfault";
            return 0;
            };
        ret.write = function(i,v){
            if(i >= 0 && i < memSize){
                mem[i] = v;
                return 0;
                }
            pub.fail.segfault = "segfault";
            return 1;
            };
        ret.foreach = function(f){
            for(var i = 0; i < memSize; i++){
                if(mem[i] !== undefined){
                    f(i,mem[i]);
                    }
                }
            };
        return ret;
        }();
    pub.fail = function(){
        var ret = {};
        ret.segfault = null;
        ret.error = null;
        ret.reset = function(){
            ret.segfault = null;
            ret.reset = null;
            };
        return ret;
        }();
    return pub;
    };
