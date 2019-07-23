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
        return o[m.tt](m.tt,m.tv);
        }
    };
var addToken2tree = function(tree,node){
    _token(node,{
        "reg":function(tokenType,tokenVal){ /* do something to tree */ },
        "imm":function(tokenType,tokenVal){ /* do something to tree */ },
        "id":function(tokenType,tokenVal){ /* do something to tree */ }
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
    0:function(tree){ return tree; },
    //[1] Lines -> Stmt eol Lines 
    1:function(tree){ return tree; },
    //[2] Lines -> 
    2:function(tree){ return tree; },
    //[3] Stmt -> id StmtType 
    3:function(tree){ return tree; },
    //[4] Stmt -> 
    4:function(tree){ return tree; },
    //[5] StmtType -> Args 
    5:function(tree){ return tree; },
    //[6] StmtType -> colon 
    6:function(tree){ return tree; },
    //[7] Args -> lpar ArgList rpar Args 
    7:function(tree){ return tree; },
    //[8] Args -> lbracket ArgM rbracket Args 
    8:function(tree){ return tree; },
    //[9] Args -> id Args 
    9:function(tree){ return tree; },
    //[10] Args -> imm Args 
    10:function(tree){ return tree; },
    //[11] Args -> reg Args 
    11:function(tree){ return tree; },
    //[12] Args -> 
    12:function(tree){ return tree; },
    //[13] ArgM -> ArgMLit 
    13:function(tree){ return tree; },
    //[14] ArgM -> ArgM times ArgM 
    14:function(tree){ return tree; },
    //[15] ArgM -> ArgM minus ArgM 
    15:function(tree){ return tree; },
    //[16] ArgM -> ArgM plus ArgM 
    16:function(tree){ return tree; },
    //[17] ArgMLit -> imm 
    17:function(tree){ return tree; },
    //[18] ArgMLit -> reg 
    18:function(tree){ return tree; },
    //[19] ArgMLit -> lbracket ArgM rbracket 
    19:function(tree){ return tree; },
    //[20] ArgList -> reg ArgListC 
    20:function(tree){ return tree; },
    //[21] ArgList -> 
    21:function(tree){ return tree; },
    //[22] ArgListC -> comma reg ArgListC 
    22:function(tree){ return tree; },
    //[23] ArgListC -> 
    23:function(tree){ return tree; }
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
        "\\$([^ \\(\\)\\n]+)|"+
        "([0-9]+)|"+
        "([a-zA-Z<>_@][^ \\(\\)\\n]*)|"+
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
                tree = pFun(tree);
                break;
            case "accept":
                alert("accept")
                return tree;
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
    return {
        exec:function(input){
            var lexed = lexer(input);
            printTokens(lexed)
            var parsed = parser(lexed)
            }
        };
    };
