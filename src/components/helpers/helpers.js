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

export function isArrayInput(param : string) {
    return param.indexOf("[]") !== -1 && !isParamToReturn(param);
}

export function isArrayToReturn(param : string) {
    return param.indexOf("[]") !== -1 && isParamToReturn(param);
}

export function isParamToReturn(param : string) {
    return param.indexOf("@") !== -1;

}

export function getCwrapParams(params : Array) {
    let toReturn = "[";
    for(let i = 0; i < params.length; i++){
        if(isArrayToReturn(params[i]))
            toReturn += "'number'";
        else if(isArrayInput(params[i]))
            toReturn += "'array'";
        else
            toReturn += "'" + getEmscriptenType(getParamType(params[i])) + "'";
        if(i !== params.length - 1)
            toReturn += ", ";
    }
    return toReturn + "]"
}
export function getParamType(param : string) {
    return (param.match(/\S+/g) || [])[0]
}

export function getParamName(param : string) {
    return (param.match(/\S+/g) || [])[1]
}

export function getReturnTableSize(paramName : string) {
    return paramName.substr(paramName.indexOf("@")+1)
}

export function removeTableSing(paramName : string) {
    let removed = paramName;
    if(paramName.indexOf("@") !== -1)
        removed = paramName.substr(0, paramName.indexOf("@"));
    return removed.replace("[]", "");
}

export function paramsInit(params : Array) {
    let toReturn = "";
    params.forEach(param => {
        let paramName = getParamName(param);
        let paramType = getParamType(param);
        if(!isArrayInput(paramName) && !isParamToReturn(paramName)) {
            toReturn += "\n\t/*********************STANDARD PARAMETER*************************/\n";
            toReturn += getParamFromObject(paramName);
        }
        if(isArrayInput(paramName)){
            toReturn += "\n\t/*********************INPUT ARRAY********************************/\n";
            toReturn += getParamArrayInFromObject(removeTableSing(paramName), paramType);
        }
        if(isArrayToReturn(paramName)){
            toReturn += "\n\t/*********************OUTPUT ARRAY*******************************/\n";
            toReturn += getParamArrayOutFromObject(removeTableSing(paramName), paramType, getReturnTableSize(paramName));
        }
    });
    return toReturn;
}


export function getParamFromObject(paramName) {
    return  "\tif(parameters." + paramName + " !== undefined){\n" +
            "\t\t alert(\"MESSAGE TO DEVELOPER: NO PARAMETER " + paramName + " IN OBJECT PASSED TO THIS FUNCTIONS\");\n" +
            "\t\t return \"error\";\n" +
            "\t}\n" +
            "\tlet " + paramName + " = parameters." + paramName + ";\n"
}

export function getParamArrayInFromObject(paramName, paramType) {
    return "\tif(parameters." + paramName + " !== undefined){\n" +
        "\t\t alert(\"MESSAGE TO DEVELOPER: NO PARAMETER " + paramName + " IN OBJECT PASSED TO THIS FUNCTIONS\");\n" +
        "\t\t return \"error\";\n" +
        "\t}\n" + getParamArrayInRest(paramName, paramType);
}

export function getParamArrayInRest(paramName, paramType) {
    switch (paramType){
        case "long":
            return getLongInArray(paramName);
        case "double":
            return getDoubleInArray(paramName);
    }
}

export function getLongInArray(paramName) {
    return "\tlet " + paramName + " = parameters." + paramName + ";\n" +
           "\tlet " + paramName + "Data = new Int32Array(" + paramName + ");\n" +
           "\tlet " + paramName + "DataBytesNumber = " + paramName + "Data.length * " + paramName + "Data.BYTES_PER_ELEMENT;\n" +
           "\tlet " + paramName + "DataPointer = Module._malloc(" + paramName + "DataBytesNumber);\n" +
           "\tlet " + paramName + "Heap = new Uint8Array(Module.HEAP32.buffer, " + paramName + "DataPointer, " + paramName + "DataBytesNumber);\n" +
           "\t" + paramName + "Heap.set(new Uint8Array(" + paramName + "Data.buffer));\n"
}

export function getDoubleInArray(paramName) {
    return "\tlet " + paramName + " = parameters." + paramName + ";\n" +
           "\tlet " + paramName + "Data = new Float64Array(" + paramName + ");\n" +
           "\tlet " + paramName + "DataBytesNumber = " + paramName + "Data.length * " + paramName + "Data.BYTES_PER_ELEMENT;\n" +
           "\tlet " + paramName + "DataPointer = Module._malloc(" + paramName + "DataBytesNumber);\n" +
           "\tlet " + paramName + "Heap = new Uint8Array(Module.HEAPF64.buffer, " + paramName + "DataPointer, " + paramName + "DataBytesNumber);\n" +
           "\t" + paramName + "Heap.set(new Uint8Array(" + paramName + "Data.buffer));\n"
}

/*OUT ARRAYS*/

export function getParamArrayOutFromObject(paramName, paramType, size) {
    switch (paramType) {
        case "double":
            return getDoubleOutArray(paramName, size);
    }
}

export function getDoubleOutArray(paramName, size) {
    return "\tlet " + paramName + "ReturnData = new Float64Array(new Array(" + size + "));\n" +
           "\tlet " + paramName + "ReturnDataBytesNumber = " + paramName + "ReturnData.length * " + paramName + "ReturnData.BYTES_PER_ELEMENT;\n" +
           "\tlet " + paramName + "ReturnDataPointer = Module._malloc(" + paramName + "ReturnDataBytesNumber);\n" +
           "\tlet " + paramName + "ReturnHeap = new Uint8Array(Module.HEAPF64.buffer, " + paramName + "ReturnDataPointer, " + paramName + "ReturnDataBytesNumber);\n";
}

export function callFunction(params : Array, inFunctionReturnType : string, inFunctionName : string) {
    let toReturn = "\n\t/*********************CALL FUNCTION******************************/\n"+
        "\tlet result = " + inFunctionName.toLowerCase() + "(";
    for(let i = 0; i < params.length; i++){
        let param = params[i];
        let paramName = getParamName(param);
        if(!isArrayInput(paramName) && !isParamToReturn(paramName))
            toReturn += removeTableSing(paramName);
        if(isArrayInput(paramName)){
            toReturn += removeTableSing(paramName) + "Heap";
        }
        if(isArrayToReturn(paramName)){
            toReturn += removeTableSing(paramName) + "ReturnHeap.byteOffset";
        }
        if(i !== params.length - 1)
            toReturn += ", ";
    }
    return toReturn + ");\n"
}

export function getReturnLine(params : Array) {
    let toReturn = "";
    let returnByArray = false;
    params.forEach(param => {
        if(isParamToReturn(param)) {
            returnByArray = true;
            toReturn += generateTakeoutResult(param)
        }
    });

    if(!returnByArray)
        return toReturn + generateFree(params) + "\n\treturn result;\n}";
    else {
        return toReturn + generateFree(params) + "\n\treturn [].slice.call(resultFromArray);\n}";
    }
}

function generateTakeoutResult(param) {
    let paramType = getParamType(param);
    let paramName = removeTableSing(getParamName(param));
    switch (paramType){
        case "double" :
            return "\tlet resultFromArray = new Float64Array(" + paramName + "ReturnHeap.buffer, "
                + paramName + "ReturnHeap.byteOffset, " + paramName + "ReturnData.length);\n"
    }
}

function generateFree(params: Array) {
    let toReturn = "\n";
    params.forEach(param => {
        if(isArrayInput(param)){
            toReturn += "\tModule._free(" + removeTableSing(getParamName(param)) + "Heap.byteOffset);\n";
        }
        if(isArrayToReturn(param)){
            toReturn += "\tModule._free(" + removeTableSing(getParamName(param)) + "ReturnHeap.byteOffset);\n";
        }
    });

    return toReturn;
}