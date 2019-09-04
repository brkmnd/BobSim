var BobLang = function(machine){
    var actionType = {
        shift:function(d){
            return {type:"shift",v:d};
            },
        reduce:function(d){
            return {type:"reduce",v:d};
            },
        accept:function(d){
            return {type:"accept",v:null};
            },
        error:function(msg){
            return {type:"error",v:msg};
            },
        none:function(){
            return {type:"none",v:null};
            },
        some:function(v){
            return {type:"some",v:v}
            }
        };
    var isSome = function(m){
        return m.t === "some";
        };
    var isNone = function(m){
        return m.t === "none";
        };
    var _token = function(m,o){
        //m.tv = token val
        //m.t = some/none
        //m.v = value if some, else null
        if(o[m.tt] !== undefined){
            return o[m.tt](m.tt,m.tv,{x:m.posX,y:m.posY,t:m.posT});
            }
        };
    var addToken2tree = function(tree,node){
        _token(node,{
            "reg":function(tokenType,tokenVal,pos){
                tree.push({type:"reg",v:tokenVal,pos:pos});
                },
            "imm":function(tokenType,tokenVal,pos){
                tree.push({type:"imm",v:parseInt(tokenVal),pos:pos});
                },
            "id":function(tokenType,tokenVal,pos){
                tree.push({type:"id",v:tokenVal,pos:pos});
                }
           });
        return tree;
        };
    var errors = {
        syntax:function(pos,msg){
            return "syntax error at (" + pos.y + "," + pos.x + "):" + msg;
            },
        garbage:function(g){
            return "garbage in expression: '" + g + "'";
            }
        };
    var productions_fun = {
        //[0] __ -> Lines 
        0:function(tree,absyn,labels){ return tree; },
        //[1] Lines -> Stmt eol Lines 
        1:function(tree,absyn,labels){ return tree; },
        //[2] Lines -> 
        2:function(tree,absyn,labels){ return tree; },
        //[3] Stmt -> id StmtType 
        3:function(tree,absyn,labels){
            var t = tree.pop();
            var id = tree.pop();
            if(t.type === "label"){
                labels[id.v] = absyn.length;
                }
            else {
                absyn.push({
                    pos:id.pos,
                    instr:id.v.toLowerCase(),
                    args:t.v.reverse()
                    });
                }
            return tree;
            },
        //[4] Stmt -> 
        4:function(tree,absyn,labels){
            return tree;
            },
        //[5] StmtType -> Args 
        5:function(tree,absyn,labels){
            return tree;
            },
        //[6] StmtType -> colon 
        6:function(tree,absyn,labels){
            tree.push({type:"label"});
            return tree;
            },
        //[7] Args -> lpar ArgList rpar Args 
        7:function(tree,absyn,labels){
            var args = tree.pop();
            var appArgs = tree.pop();
            args.v.push(appArgs);
            tree.push(args);
            return tree;
            },
        //[8] Args -> lbracket ArgM rbracket Args 
        8:function(tree,absyn,labels){
            var args = tree.pop();
            var expr = tree.pop();
            args.v.push({type:"mem-ref",v:expr});
            tree.push(args);
            return tree;
            },
        //[9] Args -> id Args 
        9:function(tree,absyn,labels){
            var args = tree.pop();
            var arg = tree.pop();
            args.v.push(arg);
            tree.push(args);
            return tree;
            },
        //[10] Args -> imm Args 
        10:function(tree,absyn,labels){
            var args = tree.pop();
            var arg = tree.pop();
            args.v.push(arg);
            tree.push(args);
            return tree;
            },
        //[11] Args -> reg Args 
        11:function(tree,absyn,labels){
            var args = tree.pop();
            var arg = tree.pop();
            args.v.push(arg);
            tree.push(args);
            return tree;
            },
        //[12] Args -> 
        12:function(tree,absyn,labels){
            tree.push({type:"args",v:[]});
            return tree;
            },
        //[13] ArgM -> ArgMLit 
        13:function(tree,absyn,labels){ return tree; },
        //[14] ArgM -> ArgM times ArgM 
        14:function(tree,absyn,labels){
            var argR = tree.pop();
            var argL = tree.pop();
            tree.push({type:"mem-expr",op:"*",l:argL,r:argR});
            return tree;
            },
        //[15] ArgM -> ArgM minus ArgM 
        15:function(tree,absyn,labels){
            var argR = tree.pop();
            var argL = tree.pop();
            tree.push({type:"mem-expr",op:"-",l:argL,r:argR});
            return tree;
            },
        //[16] ArgM -> ArgM plus ArgM 
        16:function(tree,absyn,labels){
            var argR = tree.pop();
            var argL = tree.pop();
            tree.push({type:"mem-expr",op:"+",l:argL,r:argR});
            return tree;
            },
        //[17] ArgMLit -> imm 
        17:function(tree,absyn,labels){ return tree; },
        //[18] ArgMLit -> reg 
        18:function(tree,absyn,labels){ return tree; },
        //[19] ArgMLit -> lbracket ArgM rbracket 
        19:function(tree,absyn,labels){ return tree; },
        //[20] ArgList -> reg ArgListC 
        20:function(tree,absyn,labels){
            var list = tree.pop();
            var arg = tree.pop();
            list.v.push(arg);
            list.v.reverse();
            tree.push(list);
            return tree;
            },
        //[21] ArgList -> 
        21:function(tree,absyn,labels){
            tree.push({type:"app-args",v:[]});
            return tree;
            },
        //[22] ArgListC -> comma reg ArgListC 
        22:function(tree,absyn,labels){
            var args = tree.pop();
            var arg = tree.pop();
            args.v.push(arg);
            tree.push(args);
            return tree;
            },
        //[23] ArgListC -> 
        23:function(tree,absyn,labels){
            tree.push({type:"app-args",v:[]});
            return tree;
            }
        };
    var productions_str = {
        0:{prod:"__",rside:[ "Lines"]},
        1:{prod:"Lines",rside:[ "Stmt","eol","Lines"]},
        2:{prod:"Lines",rside:[]},
        3:{prod:"Stmt",rside:[ "id","StmtType"]},
        4:{prod:"Stmt",rside:[]},
        5:{prod:"StmtType",rside:[ "Args"]},
        6:{prod:"StmtType",rside:[ "colon"]},
        7:{prod:"Args",rside:[ "lpar","ArgList","rpar","Args"]},
        8:{prod:"Args",rside:[ "lbracket","ArgM","rbracket","Args"]},
        9:{prod:"Args",rside:[ "id","Args"]},
        10:{prod:"Args",rside:[ "imm","Args"]},
        11:{prod:"Args",rside:[ "reg","Args"]},
        12:{prod:"Args",rside:[]},
        13:{prod:"ArgM",rside:[ "ArgMLit"]},
        14:{prod:"ArgM",rside:[ "ArgM","times","ArgM"]},
        15:{prod:"ArgM",rside:[ "ArgM","minus","ArgM"]},
        16:{prod:"ArgM",rside:[ "ArgM","plus","ArgM"]},
        17:{prod:"ArgMLit",rside:[ "imm"]},
        18:{prod:"ArgMLit",rside:[ "reg"]},
        19:{prod:"ArgMLit",rside:[ "lbracket","ArgM","rbracket"]},
        20:{prod:"ArgList",rside:[ "reg","ArgListC"]},
        21:{prod:"ArgList",rside:[]},
        22:{prod:"ArgListC",rside:[ "comma","reg","ArgListC"]},
        23:{prod:"ArgListC",rside:[]}
        };
    var lexer = function(inStr){
        var rxStr =
            "\\$([^ \\(\\)\\n:,\\[\\]]+)|"+
            "([0-9]+)|"+
            "([a-zA-Z<>_@][^ \\(\\)\\n:\\[\\]]*)|"+
            "(\\+)|"+
            "(\\-)|"+
            "(\\*)|"+
            "(:)|"+
            "(,)|"+
            "(\\[)|"+
            "(\\()|"+
            "(\\])|"+
            "(\\))|"+
            "(\\n|;)|"+
            "#[^\\n]*| *|\\t*";
        var rx = new RegExp(rxStr,"g");
        var retI = 0;
        var retval = {};
        var linepos = {lnr:1,start:0};
        var resStr = inStr.replace(rx,
            function(a,i1,i2,i3,i4,i5,i6,i7,i8,i9,i10,i11,i12,i13,posX){
                if(a === "\n"){
                    linepos.lnr++;
                    linepos.start = posX;
                    }
                if(typeof i1 !== "undefined"){
                    retval[retI] = {t:"some",tt:"reg",tv:i1,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i2 !== "undefined"){
                    retval[retI] = {t:"some",tt:"imm",tv:i2,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i3 !== "undefined"){
                    retval[retI] = {t:"some",tt:"id",tv:i3,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i4 !== "undefined"){
                    retval[retI] = {t:"none",tt:"plus",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i5 !== "undefined"){
                    retval[retI] = {t:"none",tt:"minus",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i6 !== "undefined"){
                    retval[retI] = {t:"none",tt:"times",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i7 !== "undefined"){
                    retval[retI] = {t:"none",tt:"colon",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i8 !== "undefined"){
                    retval[retI] = {t:"none",tt:"comma",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i9 !== "undefined"){
                    retval[retI] = {t:"none",tt:"lbracket",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i10 !== "undefined"){
                    retval[retI] = {t:"none",tt:"lpar",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i11 !== "undefined"){
                    retval[retI] = {t:"none",tt:"rbracket",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i12 !== "undefined"){
                    retval[retI] = {t:"none",tt:"rpar",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                else if(typeof i13 !== "undefined"){
                    retval[retI] = {t:"none",tt:"eol",tv:null,posX:posX - linepos.start,posY:linepos.lnr,posT:posX};
                    retI++;
                    }
                return "";
                }
            );
        if(resStr !== ""){
            retval["__success"] = false;
            retval["__res"] = resStr;
            }
        else {
            var posT = inStr.length;
            retval[retI] = {t:"none",tt:"eol",tv:null,posX:linepos.x - linepos.start,posY:linepos.lnr,posT:posT};
            retval[retI + 1] = {t:"none",v:null,tt:"$",tv:null,posX:linepos.x - linepos.start,posY:linepos.lnr,posT:posT};
            }
        return retval;
        };
    var actionTable = {
        0:{
            "reg":actionType.error("expected 'eol','id','eoi', but given 'reg'"),
            "imm":actionType.error("expected 'eol','id','eoi', but given 'imm'"),
            "id":actionType.shift(3),
            "plus":actionType.error("expected 'eol','id','eoi', but given 'plus'"),
            "minus":actionType.error("expected 'eol','id','eoi', but given 'minus'"),
            "times":actionType.error("expected 'eol','id','eoi', but given 'times'"),
            "colon":actionType.error("expected 'eol','id','eoi', but given 'colon'"),
            "comma":actionType.error("expected 'eol','id','eoi', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol','id','eoi', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol','id','eoi', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol','id','eoi', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol','id','eoi', but given 'rpar'"),
            "eol":actionType.reduce(4),
            "$":actionType.reduce(2)
            },
        1:{
            "reg":actionType.error("expected 'eoi', but given 'reg'"),
            "imm":actionType.error("expected 'eoi', but given 'imm'"),
            "id":actionType.error("expected 'eoi', but given 'id'"),
            "plus":actionType.error("expected 'eoi', but given 'plus'"),
            "minus":actionType.error("expected 'eoi', but given 'minus'"),
            "times":actionType.error("expected 'eoi', but given 'times'"),
            "colon":actionType.error("expected 'eoi', but given 'colon'"),
            "comma":actionType.error("expected 'eoi', but given 'comma'"),
            "lbracket":actionType.error("expected 'eoi', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eoi', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eoi', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eoi', but given 'rpar'"),
            "eol":actionType.error("expected 'eoi', but given 'eol'"),
            "$":actionType.accept()
            },
        2:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.shift(4),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        3:{
            "reg":actionType.shift(12),
            "imm":actionType.shift(9),
            "id":actionType.shift(8),
            "plus":actionType.error("expected 'colon','eol','id','imm','lbracket','lpar','reg', but given 'plus'"),
            "minus":actionType.error("expected 'colon','eol','id','imm','lbracket','lpar','reg', but given 'minus'"),
            "times":actionType.error("expected 'colon','eol','id','imm','lbracket','lpar','reg', but given 'times'"),
            "colon":actionType.shift(7),
            "comma":actionType.error("expected 'colon','eol','id','imm','lbracket','lpar','reg', but given 'comma'"),
            "lbracket":actionType.shift(10),
            "lpar":actionType.shift(11),
            "rbracket":actionType.error("expected 'colon','eol','id','imm','lbracket','lpar','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'colon','eol','id','imm','lbracket','lpar','reg', but given 'rpar'"),
            "eol":actionType.reduce(12),
            "$":actionType.error("expected 'colon','eol','id','imm','lbracket','lpar','reg', but given '$'")
            },
        4:{
            "reg":actionType.error("expected 'eol','id','eoi', but given 'reg'"),
            "imm":actionType.error("expected 'eol','id','eoi', but given 'imm'"),
            "id":actionType.shift(3),
            "plus":actionType.error("expected 'eol','id','eoi', but given 'plus'"),
            "minus":actionType.error("expected 'eol','id','eoi', but given 'minus'"),
            "times":actionType.error("expected 'eol','id','eoi', but given 'times'"),
            "colon":actionType.error("expected 'eol','id','eoi', but given 'colon'"),
            "comma":actionType.error("expected 'eol','id','eoi', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol','id','eoi', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol','id','eoi', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol','id','eoi', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol','id','eoi', but given 'rpar'"),
            "eol":actionType.reduce(4),
            "$":actionType.reduce(2)
            },
        5:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.reduce(5),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        6:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.reduce(3),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        7:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.reduce(6),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        8:{
            "reg":actionType.shift(12),
            "imm":actionType.shift(9),
            "id":actionType.shift(8),
            "plus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'plus'"),
            "minus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'minus'"),
            "times":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'times'"),
            "colon":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'colon'"),
            "comma":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'comma'"),
            "lbracket":actionType.shift(10),
            "lpar":actionType.shift(11),
            "rbracket":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rpar'"),
            "eol":actionType.reduce(12),
            "$":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given '$'")
            },
        9:{
            "reg":actionType.shift(12),
            "imm":actionType.shift(9),
            "id":actionType.shift(8),
            "plus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'plus'"),
            "minus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'minus'"),
            "times":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'times'"),
            "colon":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'colon'"),
            "comma":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'comma'"),
            "lbracket":actionType.shift(10),
            "lpar":actionType.shift(11),
            "rbracket":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rpar'"),
            "eol":actionType.reduce(12),
            "$":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given '$'")
            },
        10:{
            "reg":actionType.shift(20),
            "imm":actionType.shift(18),
            "id":actionType.error("expected 'imm','lbracket','reg', but given 'id'"),
            "plus":actionType.error("expected 'imm','lbracket','reg', but given 'plus'"),
            "minus":actionType.error("expected 'imm','lbracket','reg', but given 'minus'"),
            "times":actionType.error("expected 'imm','lbracket','reg', but given 'times'"),
            "colon":actionType.error("expected 'imm','lbracket','reg', but given 'colon'"),
            "comma":actionType.error("expected 'imm','lbracket','reg', but given 'comma'"),
            "lbracket":actionType.shift(19),
            "lpar":actionType.error("expected 'imm','lbracket','reg', but given 'lpar'"),
            "rbracket":actionType.error("expected 'imm','lbracket','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'imm','lbracket','reg', but given 'rpar'"),
            "eol":actionType.error("expected 'imm','lbracket','reg', but given 'eol'"),
            "$":actionType.error("expected 'imm','lbracket','reg', but given '$'")
            },
        11:{
            "reg":actionType.shift(22),
            "imm":actionType.error("expected 'reg','rpar', but given 'imm'"),
            "id":actionType.error("expected 'reg','rpar', but given 'id'"),
            "plus":actionType.error("expected 'reg','rpar', but given 'plus'"),
            "minus":actionType.error("expected 'reg','rpar', but given 'minus'"),
            "times":actionType.error("expected 'reg','rpar', but given 'times'"),
            "colon":actionType.error("expected 'reg','rpar', but given 'colon'"),
            "comma":actionType.error("expected 'reg','rpar', but given 'comma'"),
            "lbracket":actionType.error("expected 'reg','rpar', but given 'lbracket'"),
            "lpar":actionType.error("expected 'reg','rpar', but given 'lpar'"),
            "rbracket":actionType.error("expected 'reg','rpar', but given 'rbracket'"),
            "rpar":actionType.reduce(21),
            "eol":actionType.error("expected 'reg','rpar', but given 'eol'"),
            "$":actionType.error("expected 'reg','rpar', but given '$'")
            },
        12:{
            "reg":actionType.shift(12),
            "imm":actionType.shift(9),
            "id":actionType.shift(8),
            "plus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'plus'"),
            "minus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'minus'"),
            "times":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'times'"),
            "colon":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'colon'"),
            "comma":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'comma'"),
            "lbracket":actionType.shift(10),
            "lpar":actionType.shift(11),
            "rbracket":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rpar'"),
            "eol":actionType.reduce(12),
            "$":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given '$'")
            },
        13:{
            "reg":actionType.error("expected 'eoi', but given 'reg'"),
            "imm":actionType.error("expected 'eoi', but given 'imm'"),
            "id":actionType.error("expected 'eoi', but given 'id'"),
            "plus":actionType.error("expected 'eoi', but given 'plus'"),
            "minus":actionType.error("expected 'eoi', but given 'minus'"),
            "times":actionType.error("expected 'eoi', but given 'times'"),
            "colon":actionType.error("expected 'eoi', but given 'colon'"),
            "comma":actionType.error("expected 'eoi', but given 'comma'"),
            "lbracket":actionType.error("expected 'eoi', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eoi', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eoi', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eoi', but given 'rpar'"),
            "eol":actionType.error("expected 'eoi', but given 'eol'"),
            "$":actionType.reduce(1)
            },
        14:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.reduce(9),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        15:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.reduce(10),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        16:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.shift(25),
            "minus":actionType.shift(24),
            "times":actionType.shift(27),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.shift(26),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        17:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.reduce(13),
            "minus":actionType.reduce(13),
            "times":actionType.reduce(13),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.reduce(13),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        18:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.reduce(17),
            "minus":actionType.reduce(17),
            "times":actionType.reduce(17),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.reduce(17),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        19:{
            "reg":actionType.shift(20),
            "imm":actionType.shift(18),
            "id":actionType.error("expected 'imm','lbracket','reg', but given 'id'"),
            "plus":actionType.error("expected 'imm','lbracket','reg', but given 'plus'"),
            "minus":actionType.error("expected 'imm','lbracket','reg', but given 'minus'"),
            "times":actionType.error("expected 'imm','lbracket','reg', but given 'times'"),
            "colon":actionType.error("expected 'imm','lbracket','reg', but given 'colon'"),
            "comma":actionType.error("expected 'imm','lbracket','reg', but given 'comma'"),
            "lbracket":actionType.shift(19),
            "lpar":actionType.error("expected 'imm','lbracket','reg', but given 'lpar'"),
            "rbracket":actionType.error("expected 'imm','lbracket','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'imm','lbracket','reg', but given 'rpar'"),
            "eol":actionType.error("expected 'imm','lbracket','reg', but given 'eol'"),
            "$":actionType.error("expected 'imm','lbracket','reg', but given '$'")
            },
        20:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.reduce(18),
            "minus":actionType.reduce(18),
            "times":actionType.reduce(18),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.reduce(18),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        21:{
            "reg":actionType.error("expected 'rpar', but given 'reg'"),
            "imm":actionType.error("expected 'rpar', but given 'imm'"),
            "id":actionType.error("expected 'rpar', but given 'id'"),
            "plus":actionType.error("expected 'rpar', but given 'plus'"),
            "minus":actionType.error("expected 'rpar', but given 'minus'"),
            "times":actionType.error("expected 'rpar', but given 'times'"),
            "colon":actionType.error("expected 'rpar', but given 'colon'"),
            "comma":actionType.error("expected 'rpar', but given 'comma'"),
            "lbracket":actionType.error("expected 'rpar', but given 'lbracket'"),
            "lpar":actionType.error("expected 'rpar', but given 'lpar'"),
            "rbracket":actionType.error("expected 'rpar', but given 'rbracket'"),
            "rpar":actionType.shift(29),
            "eol":actionType.error("expected 'rpar', but given 'eol'"),
            "$":actionType.error("expected 'rpar', but given '$'")
            },
        22:{
            "reg":actionType.error("expected 'comma','rpar', but given 'reg'"),
            "imm":actionType.error("expected 'comma','rpar', but given 'imm'"),
            "id":actionType.error("expected 'comma','rpar', but given 'id'"),
            "plus":actionType.error("expected 'comma','rpar', but given 'plus'"),
            "minus":actionType.error("expected 'comma','rpar', but given 'minus'"),
            "times":actionType.error("expected 'comma','rpar', but given 'times'"),
            "colon":actionType.error("expected 'comma','rpar', but given 'colon'"),
            "comma":actionType.shift(31),
            "lbracket":actionType.error("expected 'comma','rpar', but given 'lbracket'"),
            "lpar":actionType.error("expected 'comma','rpar', but given 'lpar'"),
            "rbracket":actionType.error("expected 'comma','rpar', but given 'rbracket'"),
            "rpar":actionType.reduce(23),
            "eol":actionType.error("expected 'comma','rpar', but given 'eol'"),
            "$":actionType.error("expected 'comma','rpar', but given '$'")
            },
        23:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.reduce(11),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        24:{
            "reg":actionType.shift(20),
            "imm":actionType.shift(18),
            "id":actionType.error("expected 'imm','lbracket','reg', but given 'id'"),
            "plus":actionType.error("expected 'imm','lbracket','reg', but given 'plus'"),
            "minus":actionType.error("expected 'imm','lbracket','reg', but given 'minus'"),
            "times":actionType.error("expected 'imm','lbracket','reg', but given 'times'"),
            "colon":actionType.error("expected 'imm','lbracket','reg', but given 'colon'"),
            "comma":actionType.error("expected 'imm','lbracket','reg', but given 'comma'"),
            "lbracket":actionType.shift(19),
            "lpar":actionType.error("expected 'imm','lbracket','reg', but given 'lpar'"),
            "rbracket":actionType.error("expected 'imm','lbracket','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'imm','lbracket','reg', but given 'rpar'"),
            "eol":actionType.error("expected 'imm','lbracket','reg', but given 'eol'"),
            "$":actionType.error("expected 'imm','lbracket','reg', but given '$'")
            },
        25:{
            "reg":actionType.shift(20),
            "imm":actionType.shift(18),
            "id":actionType.error("expected 'imm','lbracket','reg', but given 'id'"),
            "plus":actionType.error("expected 'imm','lbracket','reg', but given 'plus'"),
            "minus":actionType.error("expected 'imm','lbracket','reg', but given 'minus'"),
            "times":actionType.error("expected 'imm','lbracket','reg', but given 'times'"),
            "colon":actionType.error("expected 'imm','lbracket','reg', but given 'colon'"),
            "comma":actionType.error("expected 'imm','lbracket','reg', but given 'comma'"),
            "lbracket":actionType.shift(19),
            "lpar":actionType.error("expected 'imm','lbracket','reg', but given 'lpar'"),
            "rbracket":actionType.error("expected 'imm','lbracket','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'imm','lbracket','reg', but given 'rpar'"),
            "eol":actionType.error("expected 'imm','lbracket','reg', but given 'eol'"),
            "$":actionType.error("expected 'imm','lbracket','reg', but given '$'")
            },
        26:{
            "reg":actionType.shift(12),
            "imm":actionType.shift(9),
            "id":actionType.shift(8),
            "plus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'plus'"),
            "minus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'minus'"),
            "times":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'times'"),
            "colon":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'colon'"),
            "comma":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'comma'"),
            "lbracket":actionType.shift(10),
            "lpar":actionType.shift(11),
            "rbracket":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rpar'"),
            "eol":actionType.reduce(12),
            "$":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given '$'")
            },
        27:{
            "reg":actionType.shift(20),
            "imm":actionType.shift(18),
            "id":actionType.error("expected 'imm','lbracket','reg', but given 'id'"),
            "plus":actionType.error("expected 'imm','lbracket','reg', but given 'plus'"),
            "minus":actionType.error("expected 'imm','lbracket','reg', but given 'minus'"),
            "times":actionType.error("expected 'imm','lbracket','reg', but given 'times'"),
            "colon":actionType.error("expected 'imm','lbracket','reg', but given 'colon'"),
            "comma":actionType.error("expected 'imm','lbracket','reg', but given 'comma'"),
            "lbracket":actionType.shift(19),
            "lpar":actionType.error("expected 'imm','lbracket','reg', but given 'lpar'"),
            "rbracket":actionType.error("expected 'imm','lbracket','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'imm','lbracket','reg', but given 'rpar'"),
            "eol":actionType.error("expected 'imm','lbracket','reg', but given 'eol'"),
            "$":actionType.error("expected 'imm','lbracket','reg', but given '$'")
            },
        28:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.shift(25),
            "minus":actionType.shift(24),
            "times":actionType.shift(27),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.shift(36),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        29:{
            "reg":actionType.shift(12),
            "imm":actionType.shift(9),
            "id":actionType.shift(8),
            "plus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'plus'"),
            "minus":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'minus'"),
            "times":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'times'"),
            "colon":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'colon'"),
            "comma":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'comma'"),
            "lbracket":actionType.shift(10),
            "lpar":actionType.shift(11),
            "rbracket":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given 'rpar'"),
            "eol":actionType.reduce(12),
            "$":actionType.error("expected 'eol','id','imm','lbracket','lpar','reg', but given '$'")
            },
        30:{
            "reg":actionType.error("expected 'rpar', but given 'reg'"),
            "imm":actionType.error("expected 'rpar', but given 'imm'"),
            "id":actionType.error("expected 'rpar', but given 'id'"),
            "plus":actionType.error("expected 'rpar', but given 'plus'"),
            "minus":actionType.error("expected 'rpar', but given 'minus'"),
            "times":actionType.error("expected 'rpar', but given 'times'"),
            "colon":actionType.error("expected 'rpar', but given 'colon'"),
            "comma":actionType.error("expected 'rpar', but given 'comma'"),
            "lbracket":actionType.error("expected 'rpar', but given 'lbracket'"),
            "lpar":actionType.error("expected 'rpar', but given 'lpar'"),
            "rbracket":actionType.error("expected 'rpar', but given 'rbracket'"),
            "rpar":actionType.reduce(20),
            "eol":actionType.error("expected 'rpar', but given 'eol'"),
            "$":actionType.error("expected 'rpar', but given '$'")
            },
        31:{
            "reg":actionType.shift(38),
            "imm":actionType.error("expected 'reg', but given 'imm'"),
            "id":actionType.error("expected 'reg', but given 'id'"),
            "plus":actionType.error("expected 'reg', but given 'plus'"),
            "minus":actionType.error("expected 'reg', but given 'minus'"),
            "times":actionType.error("expected 'reg', but given 'times'"),
            "colon":actionType.error("expected 'reg', but given 'colon'"),
            "comma":actionType.error("expected 'reg', but given 'comma'"),
            "lbracket":actionType.error("expected 'reg', but given 'lbracket'"),
            "lpar":actionType.error("expected 'reg', but given 'lpar'"),
            "rbracket":actionType.error("expected 'reg', but given 'rbracket'"),
            "rpar":actionType.error("expected 'reg', but given 'rpar'"),
            "eol":actionType.error("expected 'reg', but given 'eol'"),
            "$":actionType.error("expected 'reg', but given '$'")
            },
        32:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.reduce(15),
            "minus":actionType.reduce(15),
            "times":actionType.shift(27),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.reduce(15),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        33:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.reduce(16),
            "minus":actionType.reduce(16),
            "times":actionType.shift(27),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.reduce(16),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        34:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.reduce(8),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        35:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.reduce(14),
            "minus":actionType.reduce(14),
            "times":actionType.reduce(14),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.reduce(14),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        36:{
            "reg":actionType.error("expected 'minus','plus','rbracket','times', but given 'reg'"),
            "imm":actionType.error("expected 'minus','plus','rbracket','times', but given 'imm'"),
            "id":actionType.error("expected 'minus','plus','rbracket','times', but given 'id'"),
            "plus":actionType.reduce(19),
            "minus":actionType.reduce(19),
            "times":actionType.reduce(19),
            "colon":actionType.error("expected 'minus','plus','rbracket','times', but given 'colon'"),
            "comma":actionType.error("expected 'minus','plus','rbracket','times', but given 'comma'"),
            "lbracket":actionType.error("expected 'minus','plus','rbracket','times', but given 'lbracket'"),
            "lpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'lpar'"),
            "rbracket":actionType.reduce(19),
            "rpar":actionType.error("expected 'minus','plus','rbracket','times', but given 'rpar'"),
            "eol":actionType.error("expected 'minus','plus','rbracket','times', but given 'eol'"),
            "$":actionType.error("expected 'minus','plus','rbracket','times', but given '$'")
            },
        37:{
            "reg":actionType.error("expected 'eol', but given 'reg'"),
            "imm":actionType.error("expected 'eol', but given 'imm'"),
            "id":actionType.error("expected 'eol', but given 'id'"),
            "plus":actionType.error("expected 'eol', but given 'plus'"),
            "minus":actionType.error("expected 'eol', but given 'minus'"),
            "times":actionType.error("expected 'eol', but given 'times'"),
            "colon":actionType.error("expected 'eol', but given 'colon'"),
            "comma":actionType.error("expected 'eol', but given 'comma'"),
            "lbracket":actionType.error("expected 'eol', but given 'lbracket'"),
            "lpar":actionType.error("expected 'eol', but given 'lpar'"),
            "rbracket":actionType.error("expected 'eol', but given 'rbracket'"),
            "rpar":actionType.error("expected 'eol', but given 'rpar'"),
            "eol":actionType.reduce(7),
            "$":actionType.error("expected 'eol', but given '$'")
            },
        38:{
            "reg":actionType.error("expected 'comma','rpar', but given 'reg'"),
            "imm":actionType.error("expected 'comma','rpar', but given 'imm'"),
            "id":actionType.error("expected 'comma','rpar', but given 'id'"),
            "plus":actionType.error("expected 'comma','rpar', but given 'plus'"),
            "minus":actionType.error("expected 'comma','rpar', but given 'minus'"),
            "times":actionType.error("expected 'comma','rpar', but given 'times'"),
            "colon":actionType.error("expected 'comma','rpar', but given 'colon'"),
            "comma":actionType.shift(31),
            "lbracket":actionType.error("expected 'comma','rpar', but given 'lbracket'"),
            "lpar":actionType.error("expected 'comma','rpar', but given 'lpar'"),
            "rbracket":actionType.error("expected 'comma','rpar', but given 'rbracket'"),
            "rpar":actionType.reduce(23),
            "eol":actionType.error("expected 'comma','rpar', but given 'eol'"),
            "$":actionType.error("expected 'comma','rpar', but given '$'")
            },
        39:{
            "reg":actionType.error("expected 'rpar', but given 'reg'"),
            "imm":actionType.error("expected 'rpar', but given 'imm'"),
            "id":actionType.error("expected 'rpar', but given 'id'"),
            "plus":actionType.error("expected 'rpar', but given 'plus'"),
            "minus":actionType.error("expected 'rpar', but given 'minus'"),
            "times":actionType.error("expected 'rpar', but given 'times'"),
            "colon":actionType.error("expected 'rpar', but given 'colon'"),
            "comma":actionType.error("expected 'rpar', but given 'comma'"),
            "lbracket":actionType.error("expected 'rpar', but given 'lbracket'"),
            "lpar":actionType.error("expected 'rpar', but given 'lpar'"),
            "rbracket":actionType.error("expected 'rpar', but given 'rbracket'"),
            "rpar":actionType.reduce(22),
            "eol":actionType.error("expected 'rpar', but given 'eol'"),
            "$":actionType.error("expected 'rpar', but given '$'")
            }
        };
    var gotoTable = {
        0:{
            "Lines":actionType.some(1),
            "Stmt":actionType.some(2),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        1:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        2:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        3:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.some(6),
            "Args":actionType.some(5),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        4:{
            "Lines":actionType.some(13),
            "Stmt":actionType.some(2),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        5:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        6:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        7:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        8:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.some(14),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        9:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.some(15),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        10:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.some(16),
            "ArgMLit":actionType.some(17),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        11:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.some(21),
            "ArgListC":actionType.none()
            },
        12:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.some(23),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        13:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        14:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        15:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        16:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        17:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        18:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        19:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.some(28),
            "ArgMLit":actionType.some(17),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        20:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        21:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        22:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.some(30)
            },
        23:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        24:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.some(32),
            "ArgMLit":actionType.some(17),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        25:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.some(33),
            "ArgMLit":actionType.some(17),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        26:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.some(34),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        27:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.some(35),
            "ArgMLit":actionType.some(17),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        28:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        29:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.some(37),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        30:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        31:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        32:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        33:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        34:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        35:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        36:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        37:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            },
        38:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.some(39)
            },
        39:{
            "Lines":actionType.none(),
            "Stmt":actionType.none(),
            "StmtType":actionType.none(),
            "Args":actionType.none(),
            "ArgM":actionType.none(),
            "ArgMLit":actionType.none(),
            "ArgList":actionType.none(),
            "ArgListC":actionType.none()
            }
        };
    var parser = function(tokens){
        var sStack = new Stack();
        var tree = new Stack();
        var absyn = [];
        var labels = {};
        var i = 0;
        var parsing = true;
        if(tokens["__success"] !== undefined && !tokens["__success"]){
            var msg = errors.garbage(tokens["__res"]);
            return {absyn:null,labels:null,error:true,msg:msg};
            }
        sStack.push(0);
        while(parsing){
            var s = sStack.peek();
            var a = tokens[i].tt;
            var entry = actionTable[s][a];
            switch(entry.type){
                case "shift":
                    sStack.push(entry.v);
                    tree = addToken2tree(tree,tokens[i]);
                    i += 1;
                    break;
                case "reduce":
                    var r = entry.v;
                    var prod = productions_str[r];
                    var rSide = prod.rside;
                    var pName = prod.prod;
                    var pFun = productions_fun[r];
                    sStack.popN(rSide.length,function(x){});
                    sStack.push(gotoTable[sStack.peek()][pName].v);
                    tree = pFun(tree,absyn,labels);
                    break;
                case "accept":
                    return {absyn:absyn,labels:labels,error:false};
                case "error":
                    var token = tokens[i];
                    var pos = {x:token.posX,y:token.posY,t:token.posT};
                    var msg = errors.syntax(pos,entry.v)
                    return {absyn:null,labels:null,error:true,msg:msg,errorPos:pos};
                }
            }
        };
    /* End of Parser
     * End of Parser
     * End of Parser
     * End of Parser
     * */

    /* Status contains
     *  - variables to tell if execution is running
     *  - error messages
     *  - stats containing count of number of instruction executed etc.
     *  - traces to be used for keeping track of jumps etc.
     * */
    var StatusEval = function(){
        var echoes = [];
        return {
            prgLen:0,
            errorType:null,
            running:true,
            error:false,
            msgError:null,
            msgStatus:null,
            foreachEchoes:function(f){
                for(var i = 0; i < echoes.length; i++){
                    f(echoes[i]);
                    }
                },
            addEcho:function(instr,e){
                var msg = "echo at "+printPos(instr.pos)+": "+e;
                echoes.push(msg);
                },
            stats:{
                instrExecs:0,
                instrCount:0,
                branchTaken:0,
                branchVisited:0
                },
            incStats:{
                instrExec:function(){   
                    statusEval.stats.instrExecs++;
                    },
                branch:function(taken){
                    if(taken){
                        statusEval.stats.branchTaken++;
                        }
                    statusEval.stats.branchVisited++;
                    }
                },
            warnings:[],
            traces:function(){
                var jmps = [];
                var ret = {};
                ret.addJmp = function(instr,model,taken){
                    var mpos = {dir:model.pos.dir,br:model.pos.br,pc:model.pos.pc};
                    jmps.push({instr:instr.instr,pos:instr.pos,taken:taken,mpos:mpos});
                    };
                ret.foreachJmps = function(f){
                    for(var i = 0; i < jmps.length; i++){
                        f(jmps[i]);
                        }
                    };
                return ret;
                }(),
            failPos:{x:-1,y:-1,t:-1},
            fail:function(instr,msg){
                var msg0 = function(){
                    var m = "error";
                    if(instr !== null){
                        var res =
                            m + " at " +
                            instr.instr.toUpperCase() + " " +
                            printPos(instr.pos) +
                            ": ";
                        return res;
                        }
                    return m + ": ";
                    }();
                statusEval.failPos = instr.pos;
                statusEval.running = false;
                statusEval.error = true;
                statusEval.msgError = msg0 + msg;
                if(statusEval.errorType === null){
                    statusEval.errorType = "general";
                    }
                },
            failEmptyPrg:function(){
                statusEval.running = false;
                statusEval.error = true;
                statusEval.msgError = "error: empty program";
                statusEval.errorType = "general";
                },
            failSegfault:function(instr){
                statusEval.fail(instr,"segfault");
                },
            failArgSig:function(instr,sig /* type is array */){
                var givenSig = args2typeSig(instr.args);
                var msg = "given type sig "
                var expctSig = function(){
                    var res = "";
                    for(var i = 0; i < sig.length; i++){
                        var s = sig[i];
                        res += "(" + typeSig2names(s) + ")";
                        res += ",";
                        }
                    if(res.length === 0){
                        return "( unit )";
                        }
                    return res.substr(0,res.length - 1);
                    }();
                msg += "( " + typeSig2names(givenSig) + ")";
                msg += " but expected ";
                msg += expctSig;
                statusEval.fail(instr,msg);
                },
            failPc:function(instr,msg){
                statusEval.errorType = "pc";
                statusEval.fail(instr,msg);
                },
            failUnkInstr:function(instr){
                statusEval.fail(instr,"unknown instruction");
                },
            failOnSegfault:function(instr){
                if(machine.fail.segfault !== null){
                    statusEval.failSegfault(instr);
                    return true;
                    }
                return false;
                },
            failOnArgsSame:function(instr,arg1,arg2){
                if(arg1.v === arg2.v){
                    var m = "same register given as destination and source";
                    statusEval.fail(instr,m);
                    return true;
                    }
                return false;
                },
            stop:function(instr,msg){
                var m = "execution stopped";
                var msg0 = function(){
                    if(instr !== null){
                        var res =
                            m + " at " +
                            instr.instr.toUpperCase() + " " +
                            printPos(instr.pos) +
                            ": ";
                        return res;
                        }
                    return m + ": ";
                    }();
                statusEval.running = false;
                statusEval.msgStatus = msg0 + msg;
                },
            addWarning:function(msg){
                statusEval.warnings.push(msg);
                }
            };
        };
    var statusEval = null;
    /* Functions and variables to handle type checking.
     * */
    var dummyArgImm = {type:"imm"};
    var dummyArgReg = {type:"reg"};
    var dummyArgId = {type:"id"};
    var dummyArgAppArgs = {type:"app-args"};
    var dummyArgMem = {type:"mem-ref"};
    var typeSig2name = function(ti){
        switch(ti){
            case "0": return "imm";
            case "1": return "reg";
            case "2": return "id";
            case "3": return "arg-list";
            case "4": return "mem-ref";
            default:
                return "null";
            }
        };
    var arg2typeSig = function(arg){
        switch(arg.type){
            case "imm": return "0";
            case "reg": return "1";
            case "id":  return "2";
            case "app-args": return "3";
            case "mem-ref": return "4";
            default:
                alert("missing arg2typeSig: " + arg.type);
                return "4";
            } 
        };
    var args2typeSig = function(args){
        var retval = "";
        for(var i = 0; i < args.length; i++){
            retval += arg2typeSig(args[i]);
            }
        return retval;
        };
    var typeSig2names = function(sig){
        var res = "";
        for(var i = 0; i < sig.length; i++){
            res += typeSig2name(sig[i]);
            res += " ";
            }
        if(res.length === 0){
            return "unit";
            }
        return res;
        };
    var argsSigUnit = args2typeSig([]);
    var argsSigImm = args2typeSig([dummyArgImm]);
    var argsSigReg = args2typeSig([dummyArgReg]);
    var argsSigRegReg = args2typeSig([dummyArgReg,dummyArgReg]);
    var argsSigRegId = args2typeSig([dummyArgReg,dummyArgId]);
    var argsSigRegRegReg = args2typeSig([
        dummyArgReg,
        dummyArgReg,
        dummyArgReg
    ]);
    var argsSigRegImm = args2typeSig([dummyArgReg,dummyArgImm]);
    var argsSigRegRegId = args2typeSig([
        dummyArgReg,
        dummyArgReg,
        dummyArgId
        ]);
    var argsSigId = args2typeSig([dummyArgId]);
    var argsSigMem = args2typeSig([dummyArgMem]);
    var argsSigMemId = args2typeSig([
        dummyArgMem,
        dummyArgId
        ]);
    var argsSigMemMemId = args2typeSig([
        dummyArgMem,
        dummyArgMem,
        dummyArgId
        ]);
    var argsSigIdApp = args2typeSig([dummyArgId,dummyArgAppArgs]);
    // List of sigs
    var argsSigArit = [argsSigRegReg,argsSigRegImm];
    var argsSigBr1 = [
        argsSigMemId,
        argsSigRegId
        ];
    var argsSigBr2 = [
        argsSigMemMemId,
        argsSigRegRegId
        ];
    /* Position Manipulation 
     * Here the whole position = (pc,dir,br) is handled
     * */
    var printPos = function(pos){
        if(pos !== null){
            return "(" + pos.y.toString() + "," + pos.x.toString() + ")";
            }
        return "(-1,-1)";
        };
    var updatePos = function(pos){
        if(pos.dir === 0){
            if(pos.br === 0){
                pos.pc += 1;
                return pos;
                }
            pos.pc += pos.br;
            return pos;
            }
        if(pos.br === 0){
            pos.pc -= 1;
            return pos;
            }
        pos.pc -= pos.br;
        return pos;
        };
    var calcOffset = function(arg,pos,labels,instr){
        var pc = pos.pc;
        var i = 0;
        switch(arg.type){
            case "id":
                var l = arg.v;
                i = labels[l];
                if(i === undefined){
                    var msg = "label '"+l+"' not defined";
                    statusEval.fail(instr,msg);
                    return -1;
                    }
                break;
            default:
                //alert("not yet in calcOffset");
                break;
            }
        return i - pc;
        };
    var calcMemExpr = function(l,r,op){
        switch(op){
            case "+":
                return l + r;
            case "-":
                return l - r;
            default:
                return l * r;
            }
        };
    var calcBr = function(off,pos){
        if(pos.dir === 0){
            return pos.br + off;
            }
        return pos.br - off;
        };
    /* Misc functions for evaluation
     * */
    var argRead = function(arg){
        switch(arg.type){
            case "reg":
                var v = machine.regs.read(arg.v);
                return v;
            case "imm":
                return arg.v;
            case "mem-ref":
                var ptr = argRead(arg.v);
                var v = machine.mem.read(ptr);
                return v;
            case "mem-expr":
                var l = argRead(arg.l);
                var r = argRead(arg.r);
                var v = calcMemExpr(l,r,arg.op);
                return v;
            default:
                alert("unset arg type "+arg.type);
            }
        };
    var argWrite = function(arg,v){
        switch(arg.type){
            case "reg":
                machine.regs.write(arg.v,v);
                return true;
            case "mem":
                // In bob one can't write direclty to memory
                return false;
            default:
                return false;
            }
        };
    var pushStackFrame = function(args){
        var frame = [];
        for(var i = 0; i < 4; i++){
            var argName = "arg" + i.toString();
            var argOldVal = machine.regs.read(argName);
            var argV = function(){
                if(args[i] === undefined){
                    return 0;
                    }
                return machine.regs.read(args[i].v);
                }();
            frame.push({name:argName,v:argOldVal});
            machine.regs.write(argName,argV);
            }
        machine.stackFrame.push(frame);
        };
    var popStackFrame = function(){ 
        var frame = machine.stackFrame.pop();
        if(frame === null){
            return false;
            }
        for(var i = 0; i < frame.length; i++){
            var arg = frame[i];
            machine.regs.write(arg.name,arg.v);
            }
        return true;
        };
    var checkArgType = function(instr,sig){
        if(instr.givenSig === undefined){
            instr.givenSig = args2typeSig(instr.args);
            }
        var i = sig.indexOf(instr.givenSig);
        if(i > -1){
            return sig[i];
            }
        return null;
        };
    var execInstr = function(instr,sig,f){
        var t = checkArgType(instr,sig);
        if(t !== null){
            f(t);
            return true;
            }
        statusEval.failArgSig(instr,sig);
        return false;
        };
    /* Evaluation of an instruction is done in this function
     * The parameter model contains a pointer to the machine
     *  within evalInstr use model to access regs and mem
     *  in the above access through machine
     * */
    var evalInstr = function(model,instr,labels){
        var trackBranch = function(taken){
            // add tracking info on branch instruction
            statusEval.traces.addJmp(instr,model,taken);
            statusEval.incStats.branch(taken);
            };
        var trackInstr = function(){
            // add tracking info on instruction.
            // Do that for all instructions
            statusEval.incStats.instrExec();
            }();
        var iarg = function(i){
            return instr.args[i];
            };
        var instrPop = function(){
            var sp = model.regs.read("spointer");
            var regv = argRead(instr.args[0]);
            var memv = model.mem.read(sp);
            if(machine.fail.segfault !== null){
                statusEval.failSegfault(instr);
                return false;
                }
            model.mem.write(sp,regv);
            argWrite(instr.args[0],memv);
            model.regs.write("spointer",sp - 1);
            return true;
            };
        var instrPush = function(){
            // Exch regv <-> memv
            // spointer points at stack head
            // that is last inserted value
            var sp = model.regs.read("spointer");
            var newSp = sp + 1;
            var regv = argRead(instr.args[0]);
            var memv = model.mem.read(newSp);
            if(machine.fail.segfault !== null){
                statusEval.failSegfault(instr);
                return false;
                }
            model.mem.write(newSp,regv);
            argWrite(instr.args[0],memv);
            model.regs.write("spointer",newSp);
            return true;
            };
        var instrSwbr = function(sig){
            var f = function(t){
                var newBr = argRead(instr.args[0]);
                var oldBr = model.pos.br;
                model.pos.br = newBr;
                argWrite(instr.args[0],oldBr);
                trackBranch(true);
                };
            execInstr(instr,sig,f);
            };
        // Increment on executed instructions
        switch(instr.instr){
            // Match on given instrucion
            // New instructions are to be added here
            // And should follow the given layout
            case "swap":
                var sig = [argsSigRegReg];
                var f = function(t){
                    var a = argRead(iarg(0));
                    var b = argRead(iarg(1));
                    argWrite(iarg(0),b);
                    argWrite(iarg(1),a);
                    };
                execInstr(instr,sig,f);
                break;
            case "add":
                var sig = argsSigArit;
                var f = function(t){
                    if(!statusEval.failOnArgsSame(instr,iarg(0),iarg(1))){
                        var a = argRead(instr.args[0]);
                        var b = argRead(instr.args[1]);
                        var res = model.pos.isDirFwd() ? a + b : a - b;
                        argWrite(instr.args[0],res);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "add1":
                var sig = [argsSigReg];
                var f = function(t){
                    var a = argRead(iarg(0));
                    var res = model.pos.isDirFwd() ? a + 1 : a - 1; 
                    argWrite(iarg(0),res);
                    };
                execInstr(instr,sig,f);
                break;
            case "sub":
                var sig = argsSigArit;
                var f = function(t){
                    if(!statusEval.failOnArgsSame(instr,iarg(0),iarg(1))){
                        var a = argRead(instr.args[0]);
                        var b = argRead(instr.args[1]);
                        var res = model.pos.isDirFwd() ? a - b : a + b;
                        argWrite(iarg(0),res);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "sub1":
                var sig = [argsSigReg];
                var f = function(t){
                    var a = argRead(iarg(0));
                    var res = model.pos.dir === 0 ? a - 1 : a + 1;
                    argWrite(iarg(0),res);
                    };
                execInstr(instr,sig,f)
                break;
            case "mul":
                var sig = [argsSigRegRegReg];
                var f = function(t){
                    if(!statusEval.failOnArgsSame(instr,iarg(1),iarg(2))){
                        var a = argRead(iarg(1));
                        var b = argRead(iarg(2));
                        var t = iarg(0).v;
                        var res = a * b;
                        model.regs.xor(t,res);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "mul2":
                var sig = [argsSigReg];
                var f = function(t){
                    var a = argRead(iarg(0));
                    var res = a * 2;
                    argWrite(iarg(0),res);
                    };
                execInstr(instr,sig,f);
                break;
            case "div":
                var sig = [argsSigRegRegReg];
                var f = function(t){
                    if(!statusEval.failOnArgsSame(instr,iarg(1),iarg(2))){
                        var a = argRead(iarg(1));
                        var b = argRead(iarg(2));
                        var t = iarg(0).v;
                        var res = function(){
                            if(b === 0){
                                statusEval.fail(instr,"divide by 0 exception");
                                return 0;
                                }
                            return parseInt(a / b);
                            }();
                        model.regs.xor(t,res);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "div2":
                var sig = [argsSigReg];
                var f = function(){
                    var a = argRead(iarg(0));
                    var res = parseInt(a / 2);
                    argWrite(iarg(0),res);
                    };
                execInstr(instr,sig,f);
                break;
            case "neg":
                var sig = [argsSigReg];
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var res = 0 - a;
                    argWrite(iarg(0),res);
                    };
                execInstr(instr,sig,f);
                break;
            case "mod":
                var sig = [argsSigRegRegReg];
                var f = function(t){
                    if(!statusEval.failOnArgsSame(instr,iarg(1),iarg(2))){
                        var a = argRead(iarg(1));
                        var b = argRead(iarg(2));
                        var t = iarg(0).v;
                        var res = function(){
                            if(b === 0){
                                statusEval.fail(instr,"divide by 0 exception");
                                return 0;
                                }
                            return a % b;
                            }();  
                        model.regs.xor(t,res);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "xor":
                var sig = [argsSigRegReg];
                var f = function(t){
                    if(!statusEval.failOnArgsSame(instr,iarg(0),iarg(1))){
                        var a = argRead(instr.args[0]);
                        var b = argRead(instr.args[1]);
                        var res = a ^ b;
                        argWrite(iarg(0),res);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "xori":
                var sig = [argsSigRegImm];
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    var res = a ^ b;
                    argWrite(iarg(0),res);
                    };
                execInstr(instr,sig,f);
                break;
            case "and":
                var sig = [argsSigRegRegReg];
                var f = function(t){
                    if(!statusEval.failOnArgsSame(instr,iarg(1),iarg(2))){
                        var p = argRead(iarg(1));
                        var q = argRead(iarg(2));
                        var t = iarg(0).v;
                        var res = p & q;
                        model.regs.xor(t,res);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "or":
                var sig = [argsSigRegRegReg];
                var f = function(t){
                    if(!statusEval.failOnArgsSame(instr,iarg(1),iarg(2))){
                        var p = argRead(iarg(1));
                        var q = argRead(iarg(2));
                        var t = iarg(0).v;
                        var res = p | q;
                        model.regs.xor(t,res);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            // Memory
            case "exch":
                var sig = [argsSigRegReg];
                var f = function(t){
                    var a = argRead(iarg(0));
                    var bPtr = argRead(instr.args[1]);
                    var b = model.mem.read(bPtr);
                    if(!statusEval.failOnSegfault(instr)){
                        argWrite(iarg(0),b);
                        model.mem.write(bPtr,a);
                        }
                    };
                execInstr(instr,sig,f);
                break;
            // Branch
            case "bra":
                var sig = [argsSigId];
                var f = function(t){
                    var off = calcOffset(iarg(0),model.pos,labels,instr);
                    model.pos.br = calcBr(off,model.pos);
                    trackBranch(true);
                    };
                execInstr(instr,sig,f);
                break;
            case "rbra":
                var sig = [argsSigId];
                var f = function(){
                    // first br then change dir
                    var off = calcOffset(iarg(0),model.pos,labels,instr);
                    model.pos.br = 0 - calcBr(off,model.pos);
                    model.pos.revDir();
                    trackTrace(true);
                    };
                execInstr(instr,sig,f);
                break;
            case "bz":
                var sig = argsSigBr1;
                var f = function(t){
                    var a = argRead(iarg(0));
                    var p = a === 0;
                    if(p){
                        var off = calcOffset(iarg(1),model.pos,labels,instr);
                        model.pos.br = calcBr(off,model.pos);
                        }
                    trackBranch(p);
                    };
                execInstr(instr,sig,f);
                break;
            case "bnz":
                var sig = argsSigBr1;
                var f = function(t){
                    var a = argRead(iarg(0));
                    var p = a !== 0;
                    if(p){
                        var off = calcOffset(iarg(1),model.pos,labels,instr);
                        model.pos.br = calcBr(off,model.pos);
                        }
                    trackBranch(p);
                    };
                execInstr(instr,sig,f);
                break;
            case "beq":
                var sig = argsSigBr2;
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    var p = a === b;
                    if(p){
                        var off = calcOffset(iarg(2),model.pos,labels,instr);
                        model.pos.br = calcBr(off,model.pos);
                        }
                    trackBranch(p);
                    };
                execInstr(instr,sig,f);
                break;
            case "bneq":
                var sig = argsSigBr2;
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    var p = a !== b;
                    if(p){
                        var off = calcOffset(iarg(2),model.pos,labels,instr);
                        model.pos.br = calcBr(off,model.pos);
                        }
                    trackBranch(p);
                    };
                execInstr(instr,sig,f);
                break;
            case "bgt":
                var sig = argsSigBr2;
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    var p = a > b;
                    if(p){
                        var off = calcOffset(iarg(2),model.pos,labels,instr);
                        model.pos.br = calcBr(off,model.pos);
                        }
                    trackBranch(p);
                    };
                execInstr(instr,sig,f);
                break;
            case "bgeq":
                var sig = argsSigBr2;
                var f = function(t){
                    var a = argRead(iarg(0));
                    var b = argRead(iarg(1));
                    var p = a >= b;
                    if(p){
                        var off = calcOffset(iarg(2),model.pos,labels,instr);
                        model.pos.br = calcBr(off,model.pos);
                        }
                    trackBranch(p);
                    };
                execInstr(instr,sig,f);
                break;
            case "blt":
                var sig = argsSigBr2;
                var f = function(t){
                    var a = argRead(iarg(0));
                    var b = argRead(iarg(1));
                    var p = a < b;
                    if(p){
                        var off = calcOffset(iarg(2),model.pos,labels,instr);
                        model.pos.br = calcBr(off,model.pos);
                        }
                    trackBranch(p);
                    };
                execInstr(instr,sig,f);
                break;
            case "bleq":
                var sig = argsSigBr2;
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    var p = a <= b;
                    if(p){
                        var off = calcOffset(iarg(2),model.pos,labels,instr);
                        model.pos.br = calcBr(off,model.pos);
                        }
                    trackBranch(p);
                    };
                execInstr(instr,sig,f);
                break;
            case "push":
                var sig = [argsSigReg];
                var f = function(t){
                    if(model.pos.isDirFwd()){
                        instrPush();
                        }
                    else {
                        instrPop();
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "pop":
                var sig = [argsSigReg];
                var f = function(t){
                    if(model.pos.isDirFwd()){
                        instrPop();
                        }
                    else {
                        instrPush();
                        }
                    };
                execInstr(instr,sig,f);
                break;
            case "call":
                var sig = [argsSigIdApp];
                var f = function(t){
                    var appArgs = instr.args[1];
                    var off = calcOffset(iarg(0),model.pos,labels,instr);
                    var br = calcBr(off,model.pos);
                    if(br !== 0){
                        pushStackFrame(appArgs.v);
                        }
                    else {
                        popStackFrame();
                        }
                    model.pos.br = br;
                    trackBranch(true);
                    };
                execInstr(instr,sig,f);
                break;
            case "rcall":
                var sig = [argsSigIdApp];
                var f = function(t){
                    var appArgs = iarg(1);
                    var off = calcOffset(iarg(0),model.pos,labels,instr);
                    var br = 0 - calcBr(off,model.pos);
                    statusEval.traces.addJmp(instr,model,true);
                    if(br !== 0){
                        pushStackFrame(appArgs.v);
                        }
                    else {
                        popStackFrame();
                        }
                    model.pos.revDir();
                    model.pos.br = br;
                    trackBranch(true);
                    };
                execInstr(instr,sig,f);
                break;
            case "swret":
                // identical to SWBR
                var sig = [argsSigReg];
                instrSwbr(sig);
                break;
            case "swbr":
                var sig = [argsSigReg];
                instrSwbr(sig);
                break;
            case "stop":
                var sig = [argsSigUnit];
                var f = function(t){
                    var msg = "manual stop";
                    statusEval.stop(instr,msg);
                    };
                execInstr(instr,sig,f);
                break;
            case "nop":
                var sig = [argsSigUnit];
                var f = function(t){};
                execInstr(instr,sig,f);
                break;
            // error handling / misc
            case "echo":
                // if id, echo offset
                var sig = [
                    argsSigMem,
                    argsSigImm,
                    argsSigId,
                    argsSigReg
                    ];
                var f = function(t){
                    var a = iarg(0);
                    var v = function(){
                        if(a.type === "id"){
                            return calcOffset(a,model.pos,labels,instr).toString();
                            }
                        return argRead(iarg(0)).toString();
                        }();
                    statusEval.addEcho(instr,v);
                    };
                execInstr(instr,sig,f);
                break;
            default:
                statusEval.failUnkInstr(instr);
                break;
            }
        };
    var evalPrg = function(prg,labels){
        var pos = {
            pc:0,br:0,dir:0,
            revDir:function(){
                pos.dir = pos.dir === 1 ? 0 : 1;
                },
            isDirFwd:function(){
                return pos.dir === 0;
                }
            };
        var model = {mem:machine.mem,regs:machine.regs,pos:pos};
        statusEval.prgLen = prg.length;
        if(prg.length === 0){
            statusEval.failEmptyPrg()
            }
        while(statusEval.running){
            var instr = prg[pos.pc];
            evalInstr(model,instr,labels);
            updatePos(model.pos);
            if(!statusEval.running){
                break;
                }
            if(model.pos.pc < 0){
                var msg = "pc < 0";
                statusEval.failPc(instr,msg);
                }
            if(model.pos.pc >= prg.length){
                var msg = "pc > prg.length";
                statusEval.failPc(instr,msg);
                }
            }
        };
    return {
        exec:function(input){
            statusEval = new StatusEval();
            var lexed = lexer(input);
            var parsed = parser(lexed);
            if(parsed.error){
                statusEval.failPos = parsed.errorPos;
                return {error:true,type:"syntax",msg:parsed.msg,statusEval:statusEval};
                }
            var setSpointer = function(){
                machine.regs.write("spointer",0);
                }();
            evalPrg(parsed.absyn,parsed.labels);
            if(statusEval.error){
                return {error:true,type:"runtime",msg:statusEval.msgError,statusEval:statusEval};
                }
            return {error:false,msg:"",statusEval:statusEval};
            },
        filterRes:function(f){
            machine.regs.foreach(function(r,v){
                if(r.substr(0,4) === "res."){
                    f(r.substr(4),v);
                    }
                });
            }
        };
    };
