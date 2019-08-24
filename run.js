/* - The tests for now have non-zeroed register
 * this means that if test is run again on same simulator
 * it will fail
 * */
var Printer = function(p){
    return function(str,c){
        if(c !== undefined){
            p.innerHTML += "<font color='"+c+"'>"+str+"</font>\n";
            }
        else {
            p.innerHTML += str + "\n";
            }
        };
    };
var printTraceJmp = function(statusEval){
    var str = "<b style='color:red;'>Jump Traces</b><br>";
    var i = 0;
    str += "<table style='font-family:monospace;font-size:12pt;' border='1'>";
    str += "<tr><td>i</td><td>Taken</td><td>Instruction</td><td>model.pos</td></tr>";
    statusEval.traces.foreachJmps(function(t){
        str += "<tr>";
        str += "<td>";
        str += i.toString();
        str += "</td>";
        str += "<td>";
        str += t.taken ? "+" : "-";
        str += "</td>";
        str += "<td>";
        str += t.instr;
        str += " (";
        str += t.pos.y;
        str += ",";
        str += t.pos.x;
        str += ")";
        str += "</td>";
        str += "<td>";
        str += "pc:" + t.mpos.pc.toString() + ", ";
        str += "dir:" + t.mpos.dir.toString() + ", ";
        str += "br:" + t.mpos.br.toString();
        str += "</td>";
        str += "</tr>";
        i++;
        });
    str += "</table>";
    return str;
    };
var printPrg = function(prg,cb){
    var lines = prg.split("\n");
    for(var i = 0; i < lines.length; i++){
        var line = document.createElement("tr");
        var nr = document.createElement("td");
        var cline = document.createElement("td");
        nr.style.borderRight = "2px dotted red";
        nr.innerHTML = (i + 1).toString();
        cline.style.whiteSpace = "pre";
        cline.innerHTML = lines[i];
        line.appendChild(nr);
        line.appendChild(cline);
        cb.appendChild(line);
        }
    };
var checkOnExpected = function(expct,res,printfn){
    var ks = Object.keys(expct);
    printfn("checking result holding registers against expected values","blue");
    for(var i = 0; i < ks.length; i++){
        var k = ks[i];
        if(res[k] === undefined){
            var msg = function(){
                var ks0 = Object.keys(res);
                var r = "- " +  k + " is not present in resulting registers\n"; 
                r += "these are:\n";
                for(var j = 0; j < ks0.length; j++){
                    r += ks0[j] + " = " + res[ks0[j]] + "\n";
                    }
                return r
                }();
            printfn(msg);
            }
        else if(expct[k] !== res[k]){
            printfn("- "+k+" expected to be " + expct[k].toString() + " but is "+res[k].toString(),"red");
            }
        else {
            printfn("+ " + k + " matches expected with value " + res[k].toString(),"green");
            }
        }
    };
var prgs = document.getElementsByClassName("bobprg");
var outs = document.getElementsByClassName("out");
var errOuts = document.getElementsByClassName("error-out");
var codeTables = document.getElementsByClassName("codetable");
var runTest = function(i){
    var machine = new Machine();
    var bob = new BobSim(machine);
    var prg = prgs[i].innerHTML;
    var evaled = bob.exec(prg);
    var printfn = new Printer(outs[i]);
    var ctable = codeTables[i];
    var filterRes = function(){
        var res = {};
        bob.filterRes(function(r,v){
            res[r] = v;
            });
        return res;
        }();
    var expectedRes = results[i];
    if(evaled.error){
        printfn(evaled.msg,"red");
        if(evaled.statusEval.errorType === "pc"){
            printfn(printTraceJmp(evaled.statusEval));
            }
        }
    else {
        printfn("success","green");
        }
    checkOnExpected(expectedRes,filterRes,printfn);
    printPrg(prg,ctable);
    };
for(var i = 0; i < prgs.length; i++){
    runTest(i);
    }
