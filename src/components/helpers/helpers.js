export function getEmscriptenType(cType){
    switch(cType) {
        case "int":
        case "double":
        case "float":
        case "long":
        case "int*":
        case "double*":
        case "float*":
        case "long*":
        case "int *":
        case "double *":
        case "float *":
        case "long *":
            return "number";
        case "char*":
        case "char *":
            return "string";
        case "void":
        case "void*":
        case "void *":
            return "null";
    }
}

export function isArray(param : string) {
    return param.indexOf("[]") !== -1 && !isParamToReturn(param);

}

export function isParamToReturn(param : string) {
    return param.indexOf("@") !== -1;

}

export function getCwrapParams(params : Array) {
    let toReturn = "[";
    for(let i = 0; i < params.length; i++){
        if(isParamToReturn(params[i]))
            toReturn += "'number'";
        else if(isArray(params[i]))
            toReturn += "'array'";
        else
            toReturn += "'" + getEmscriptenType(getParamType(params[i])) + "'";
        if(i !== params.length - 1)
            toReturn += ", ";
    }
    return toReturn + "]"
}
export function getParamType(param : string) {
    return param.split(" ")[0]
}

export function getParamName(param : string) {
    return param.split(" ")[1]
}

export function paramsInit(params : Array) {
    let toReturn = "";
    params.forEach(param => {
        if(!isArray(getParamName(param)) && !isParamToReturn(getParamName(param)))
            toReturn += getFromMap(getParamName(param));
    });
    return toReturn;
}

export function getFromMap(param) {
    return "\tlet " + param + " = parametersInMap.get(\"" + param + "\");\n" +
        "\tif(!parametersInMap.has(\"" + param + "\"))\n" +
        "\t\t console.log(\"NO PARAMETER: " + param + " IN MAP PASSED TO THIS FUNCTIONS\");\n";
}

export function callFunction(params : Array, inFunctionReturnType : string, inFunctionName : string) {
    let toReturn = "\tlet result = " + inFunctionName.toLowerCase() + "(";
    for(let i = 0; i < params.length; i++){
        let param = params[i];
        if(!isArray(getParamName(param)) && !isParamToReturn(getParamName(param)))
            toReturn += getParamName(param);
        if(i !== params.length - 1)
            toReturn += ", ";
    }
    return toReturn + ");\n"
}

export function getReturnLine(params : Array) {
    let returnByArray = false;
    params.forEach(param => {
        if(isParamToReturn(param))
            returnByArray = true;
    });

    if(!returnByArray)
        return "\treturn result;\n}"
}