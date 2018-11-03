import React from "react";
import {Route} from 'react-router-dom';
import {Col, Layout, Row} from 'antd';
import {Button, ControlLabel, FormControl, FormGroup} from "react-bootstrap";
import {callFunction, getCwrapParams, getEmscriptenType, getReturnLine, paramsInit} from "../helpers/helpers";
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/theme/dracula';

const {Header, Content, Footer} = Layout;

class MainPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);
        this.getIn = this.getIn.bind(this);
        this.generateOutput = this.generateOutput.bind(this);

        this.state = {
            functionSignature: "",
            input: "",
            inFunctionReturnType: "",
            inFunctionName: "",
            inFunctionParameters: [],
            output: "",
            helpBlock: "",
            helpButtonText: "Show help"
        };
    }

    handleChange(e) {
        this.setState({functionSignature: e.target.value});
        e.preventDefault();
        this.state.input = e.target.value.trim();
        this.getIn();
    }

    getIn() {
        let firstSpace = this.state.input.indexOf(" ");
        let firstBracket = this.state.input.indexOf("(");
        let secondBracket = this.state.input.indexOf(")");
        this.state.inFunctionReturnType = this.state.input.substr(0, firstSpace).trim();
        this.state.inFunctionName = this.state.input.substr(firstSpace + 1, firstBracket - firstSpace - 1).trim();
        this.state.inFunctionParameters = this.state.input.substr(firstBracket + 1, secondBracket - firstBracket - 1)
            .split("const").join("").trim().split(",").map(e => e.trim());
        this.generateOutput();
    }

    generateOutput() {
        let beigning = "export default function " + this.state.inFunctionName + "(parameters) {\n";
        let cwrap = "\tlet " + this.state.inFunctionName.toLowerCase() + " = Module.cwrap('" +
            this.state.inFunctionName + "', '" + getEmscriptenType(this.state.inFunctionReturnType) + "', " +
            getCwrapParams(this.state.inFunctionParameters) + ");\n";
        let params = paramsInit(this.state.inFunctionParameters);
        let callFun = callFunction(this.state.inFunctionParameters, this.state.inFunctionReturnType, this.state.inFunctionName);
        let returnLine = getReturnLine(this.state.inFunctionParameters);
        this.setState({output: beigning + cwrap + params + callFun + returnLine});
    }

    _downloadTxtFile = () => {
        const element = document.createElement("a");
        const file = new Blob([new TextEncoder().encode(this.state.output)], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = this.state.inFunctionName + ".js";
        element.click();
    };

    showExample = () => {
        let example = "int funFromC( const long n, const double inputArray[], double outputArray[]@n);";
        this.setState({functionSignature: example});
        this.state.input = example;
        this.getIn();
    };

    showHelp = () => {
        if (this.state.helpBlock === "") {
            this.setState({helpButtonText: "Hide help"});
            this.setState({helpBlock: this.getHelpBlock()});
        } else {
            this.setState({helpButtonText: "Show help"});
            this.setState({helpBlock: ""});
        }
    };

    getHelpBlock = () => {
        return <div>
            <div><b>Return data by array:</b> f.e. you have <code>int random(n, double outputArray[]) </code> just add <code>@n </code>
            after <code>[]</code> just like that <code>int random(n, double outputArray[]@n)</code> now converter knows that you want to return
                n double values from C function.
            </div>
            <h5>Supported types</h5>
            <div><b>Return type  :</b> All C types, pointers not working</div>
            <div><b>Simple argument type:</b> All C types</div>
            <div><b>Arrays to pass data to function:</b> double, long</div>
            <div><b>Arrays to get data from function :</b> double </div>
            <div><b>Tips :</b> use [] instead pointer</div>
        </div>
    };

    render() {
        return (
            <div>
                <Route exact={true} path={"/"} render={() => (
                    <Layout className="layout">
                        <Header style={{background: "#fff", paddingTop: 20}}>
                            <Row type='flex' gutter={8} align="center">
                                <Col>
                                    <h4>Converter of C function signature to JavaScript function.</h4>
                                </Col>
                            </Row>
                        </Header>
                        <Content style={{padding: '0 75px', background: '#fff'}}>
                            <Row key={1} align="center">
                                {/*INPUT*/}
                                <FormGroup controlId="formBasicText1">
                                    <ControlLabel>
                                        C function signature
                                        <Button onClick={this.showExample}>Show example</Button>
                                        <Button onClick={this.showHelp}>{this.state.helpButtonText}</Button>
                                    </ControlLabel>
                                    {this.state.helpBlock}
                                    <FormControl
                                        componentClass="textarea"
                                        placeholder="Enter text"
                                        onChange={this.handleChange}
                                        value={this.state.functionSignature}
                                    />
                                </FormGroup>
                            </Row>

                            <Button onClick={this._downloadTxtFile}>Download file</Button>

                            <Row key={2} align="center" style={{flex: 1, paddingBottom: 25}}>
                                {/*OUTPUT*/}
                                <FormGroup controlId="formBasicText2">
                                    <ControlLabel>JavaScript Code</ControlLabel>
                                    {/*<FormControl*/}
                                        {/*componentClass="textarea"*/}
                                        {/*value={this.state.output}*/}
                                        {/*placeholder="Enter text"*/}
                                        {/*style={{height: 400}}*/}
                                        {/*disabled={true}*/}
                                    {/*/>*/}
                                    <AceEditor
                                        mode="javascript"
                                        theme="dracula"
                                        value={this.state.output}
                                        name="UNIQUE_ID_OF_DIV"
                                        editorProps={{$blockScrolling: true}}
                                        showPrintMargin={false}
                                        style={{height: 400, width: 1200}}
                                    />
                                </FormGroup>
                            </Row>
                        </Content>
                        <Footer style={{textAlign: 'center', background: '#fff'}}>
                            cToJsFunctionsGenerator ©2018
                        </Footer>
                    </Layout>
                )}/>
            </div>
        );
    }
}

export default MainPage;
