    var Stack = function(){
        var stack = {};
        var len = 0;
        var pub = {};
        pub.push = function(v0){
            if(stack[len] !== undefined){
                stack[len].val = v0;
            }
            else {
                stack[len] = {val:v0};
                }
            len++;
            };
        pub.pop = function(){
            if(len > 0){
                len--;
                return stack[len].val;
                }
            return null;
            };
        pub.popN = function(n,f){
            var n0 = n;
            while(len > 0 && n0 > 0){
                f(this.pop());
                n0--;
                }
            };
        pub.peek = function(){
            if(len > 0){
                return stack[len - 1].val;
                }
            return null;
            };
        pub.foreach = function(f){
            var i = len - 1;
            while(i >= 0){
                f(stack[i].val);
                i--;
                }
            };
        pub.count = function(){
            return len;
            };
        return pub;
        };
