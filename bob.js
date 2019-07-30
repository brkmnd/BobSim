var BobSim = function(machine){
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
            return o[m.tt](m.tt,m.tv,{x:m.posX,y:m.posY});
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
        14:function(tree,absyn,labels){ return tree; },
        //[15] ArgM -> ArgM minus ArgM 
        15:function(tree,absyn,labels){ return tree; },
        //[16] ArgM -> ArgM plus ArgM 
        16:function(tree,absyn,labels){ return tree; },
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
            "\\$([^ \\(\\)\\n:,]+)|"+
            "([0-9]+)|"+
            "([a-zA-Z<>_@][^ \\(\\)\\n:]*)|"+
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
                    retval[retI] = {t:"some",tt:"reg",tv:i1,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i2 !== "undefined"){
                    retval[retI] = {t:"some",tt:"imm",tv:i2,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i3 !== "undefined"){
                    retval[retI] = {t:"some",tt:"id",tv:i3,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i4 !== "undefined"){
                    retval[retI] = {t:"none",tt:"plus",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i5 !== "undefined"){
                    retval[retI] = {t:"none",tt:"minus",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i6 !== "undefined"){
                    retval[retI] = {t:"none",tt:"times",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i7 !== "undefined"){
                    retval[retI] = {t:"none",tt:"colon",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i8 !== "undefined"){
                    retval[retI] = {t:"none",tt:"comma",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i9 !== "undefined"){
                    retval[retI] = {t:"none",tt:"lbracket",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i10 !== "undefined"){
                    retval[retI] = {t:"none",tt:"lpar",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i11 !== "undefined"){
                    retval[retI] = {t:"none",tt:"rbracket",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i12 !== "undefined"){
                    retval[retI] = {t:"none",tt:"rpar",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
                    retI++;
                    }
                else if(typeof i13 !== "undefined"){
                    retval[retI] = {t:"none",tt:"eol",tv:null,posX:posX - linepos.start,posY:linepos.lnr};
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
            retval[retI] = {t:"none",tt:"eol",tv:null,posX:linepos.x - linepos.start,posY:linepos.lnr};
            retval[retI + 1] = {t:"none",v:null,tt:"$",tv:null,posX:linepos.x - linepos.start,posY:linepos.lnr};
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
            alert("lexer error")
            tree.push({error:true,msg:errors.garbage(tokens["__res"])});
            return tree;
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
                    alert("accept");
                    return {absyn:absyn,labels:labels};
                case "error":
                    var token = tokens[i];
                    tree.push({error:true,msg:errors.syntax({x:token.posX,y:token.posY},entry.v)});
                    return tree;
                }
            }
        };
    /* End of Parser
     * 
     * */
    /* Error dealing functions */
    var printTokens = function(ts){
        var i = 0;
        while(ts[i] !== undefined){
            var t = ts[i]
            printfn(t.tv + "["+t.tt+"]");
            i++;
            }
        };
    var printArg = function(arg){
        switch(arg.type){
            case "reg":
                return "$" + arg.v;
            case "id":
                return arg.v;
            case "imm":
                return arg.v;
            case "app-args":
                return printAppArgs(arg.v);
            default:
                return "0";
            }
        };
    var printAppArgs = function(args){
        var res = "(";
        for(var i = 0; i < args.length; i++){
            var arg = args[i];
            res += printArg(arg);
            res += ",";
            }
        if(args.length > 0){
            res = res.substr(0,res.length - 1);
            }
        return res + ")";
        };
    var printInstrArgs = function(args){
        var res = "";
        for(var i = 0; i < args.length; i++){
            var arg = args[i];
            res += printArg(arg);
            res += "&nbsp;&nbsp;";
            }
        return res;
        };
    var printAbSyn = function(absyn){
        var res = "<table style='font-family:monospace;font-size:12pt;'>";
        for(var i = 0; i < absyn.length; i++){
            var line = absyn[i];
            res += "<tr>";
            res += "<td style='width:50px;color:gray;'>";
            res += i.toString();
            res += "</td>";
            res += "<td style='width:200px;color:red;'>";
            res += line.instr;
            res += "</td>";
            res += "<td>";
            res += printInstrArgs(line.args);
            res += "</td>";
            res += "</tr>";
            }
        printfn(res);
        };
    var printLabels = function(ls){
        var ks = Object.keys(ls);
        for(var i = 0; i < ks.length; i++){
            var k = ks[i];
            var str = "";
            str += k;
            str += " &rarr; ";
            str += ls[k];
            printfn(str);
            }
        };

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
    var dummyArgImm = {type:"imm"};
    var dummyArgReg = {type:"reg"};
    var dummyArgId = {type:"id"};
    var dummyArgAppArgs = {type:"app-args"};
    var arg2typeSig = function(arg){
        switch(arg.type){
            case "imm": return "0";
            case "reg": return "1";
            case "id":  return "2";
            case "app-args": return "3";
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
    var argsSigMemId = args2typeSig(
        // need to be included in absyn
        []
        );
    var argsSigMemMemId = args2typeSig([
        //dummyArgMem,
        //dummyArgMem,
        dummyArgId
        ]);
    // List of sigs
    var argsSigArit = [argsSigRegReg,argsSigRegImm];
    var argsSigBr1 = [argsSigRegId];
    var argsSigBr2 = [
        argsSigMemMemId,
        argsSigRegRegId
        ];
    var statusEval = {
        prgLen:0,
        running:true,
        error:false,
        msgError:null,
        msgStatus:null,
        warnings:[],
        traceJumps:[],
        fail:function(instr,msg){
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
            statusEval.error = true;
            statusEval.msgError = msg0 + msg;
            },
        failSegfault:function(instr){
            statusEval.fail(instr,"segfault");
            },
        stop:function(instr,msg){
            var msg0 = function(){
                var m = "execution stopped";
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
            },
        reset:function(){
            statusEval.prgLen = 0;
            statusEval.running = true;
            statusEval.error = false;
            statusEval.msgStatus = null;
            statusEval.msgError = null;
            statusEval.warnings = [];
            statusEval.traceJumps = [];
            }
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
        //return sig.indexOf(instr.givenSig) > -1;
        };
    var evalInstr = function(model,instr){
        var argRead = function(arg){
            switch(arg.type){
                case "reg":
                    var v = model.regs.read(arg.v);
                    return v;
                //case "mem": return 0;
                case "imm":
                    return arg.v;
                default:
                    alert("unset arg type "+arg.type);
                }
            };
        var argWrite = function(arg,v){
            switch(arg.type){
                case "reg":
                    model.regs.write(arg.v,v);
                    return true;
                case "mem":
                    model.mem.write(arg.v,v);
                    return true;
                default:
                    return false;
                }
            };
        var execInstr = function(sig,f){
            var t = checkArgType(instr,sig);
            if(t !== null){
                f(t);
                return true;
                }
            return false;
            };
        switch(instr.instr){
            case "swap":
                var sig = [argsSigRegReg];
                break;
            case "add":
                var sig = argsSigArit;
                var f = function(t){
                    // check if args are same
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    var res = model.pos.dir === 0 ? a + b : a - b;
                    alert("res +:" + res);
                    argWrite(instr.args[0],res);
                    };
                execInstr(sig,f);
                break;
            case "add1":
                var sig = [argsSigReg];
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var res = model.pos.dir === 0 ? a + 1 : a - 1; 
                    argWrite(instr.args[0],res);
                    };
                execInstR(sig,f);
                break;
            case "sub":
                var sig = argsSigArit;
                break;
            case "sub1":
                var sig = [argsSigReg];
                break;
            case "mul":
                var sig = [argsSigRegRegReg];
                break;
            case "mul2":
                var sig = [argsSigReg];
                break;
            case "div":
                var sig = [argsSigRegRegReg];
                break;
            case "div2":
                var sig = [argsSigReg];
                break;
            case "neg":
                var sig = [argsSigReg];
                break;
            case "mod":
                var sig = [argsSigRegRegReg];
                break;
            case "xor":
                var sig = [argsSigRegReg];
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    var res = a ^ b;
                    argWrite(instr.args[0],res);
                    };
                execInstr(sig,f);
                break;
            case "xori":
                var sig = [argsSigRegImm];
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    var res = a ^ b;
                    argWrite(instr.args[0],res);
                    };
                execInstr(sig,f);
                break;
            case "and":
                var sig = [argsSigRegRegReg];
                break;
            case "or":
                var sig = [argsSigRegRegReg];
                break;
            // Memory
            case "exch":
                var sig = [argsSigRegReg];
                var f = function(t){
                    var a = argRead(instr.args[0]);
                    var b = argRead(instr.args[1]);
                    if(machine.fail.segfault !== null){
                        statusEval.failSegfault(instr);
                        }
                    else {
                        argWrite(instr.args[0],b);
                        argWrite(instr.args[1],a);
                        }
                    };
                execInstr(sig,f);
                break;
            // Branch
            case "bz":
                var sig = argsSigBr1;
                break;
            case "bnz":
                var sig = argsSigBr1;
                break;
            case "beq":
                var sig = argsSigBr2;
                break;
            case "blt":
                var sig = argsSigBr2;
                break;
            default:
                //printfn("not yet instr: "+instr.instr);
                break;
            }
        };
    var evalPrg = function(prg,labels){
        var pos = {pc:0,br:0,dir:0};
        var model = {mem:machine.mem,regs:machine.regs,pos:pos};
        statusEval.reset();
        statusEval.prgLen = prg.length;
        while(statusEval.running){
            var instr = prg[pos.pc];
            evalInstr(model,instr);
            model.pos = updatePos(model.pos);
            if(model.pos.pc < 0){
                statusEval.stop(instr,"pc < 0");
                }
            if(model.pos.pc >= prg.length){
                statusEval.stop(instr,"pc > prg.length");
                }
            }
        if(statusEval.error){
            alert("error:"+statusEval.msgError);
            }
        else {
            alert(statusEval.msgStatus);
            }
        };
    return {
        exec:function(input){
            var lexed = lexer(input);
            //printTokens(lexed)
            var parsed = parser(lexed);
            //printAbSyn(parsed.absyn);
            //printLabels(parsed.labels);
            evalPrg(parsed.absyn,parsed.labels);
            printfn("regs:");
            machine.regs.foreach(function(n,r){
                printfn(n + " -> " + r);
                });
            }
        };
    };
