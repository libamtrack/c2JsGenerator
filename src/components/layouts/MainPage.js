import React from "react";
import {Route} from 'react-router-dom';
import {Col, Layout, Row} from 'antd';
import {Button, ButtonToolbar, FormLabel, FormGroup} from "react-bootstrap";
import {callFunction, getCwrapParams, getEmscriptenType, getReturnLine, paramsInit} from "../helpers/helpers";
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/mode/c_cpp';
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
        this.state.input = e.trim();
        this.state.functionSignature = e.trim();
        try {
            this.getIn();
        } catch (e) {
            console.error(e)
        }
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
                            <Row type='flex' gutter={8} align="middle">
                                <Col>
                                    <h4>Converter of C function signature to JavaScript function.</h4>
                                </Col>
                            </Row>
                        </Header>
                        <Content style={{padding: '0 75px', background: '#fff'}}>
                            <Row key={1} align="middle">
                                {/*INPUT*/}
                                <FormGroup controlId="formBasicText1">
                                    <FormLabel>
                                        <ButtonToolbar>
                                            <Button variant="primary" onClick={this.showExample}>Show example</Button>
                                            <Button variant="success" style={{marginLeft: 10}} onClick={this.showHelp}>{this.state.helpButtonText}</Button>
                                        </ButtonToolbar>
                                        {this.state.helpBlock}
                                        <h5>C function signature</h5>
                                    </FormLabel>

                                    <AceEditor
                                        mode="c_cpp"
                                        theme="dracula"
                                        onChange={this.handleChange}
                                        value={this.state.functionSignature}
                                        name="INPUT"
                                        editorProps={{$blockScrolling: true}}
                                        showPrintMargin={false}
                                        style={{height: 80}}
                                        width="100%"
                                    />
                                </FormGroup>
                            </Row>
                            <Button variant="danger" onClick={this._downloadTxtFile}>Download file</Button>
                            <Row key={2} align="middle" style={{flex: 1, paddingBottom: 25}}>
                                {/*OUTPUT*/}
                                <FormLabel><h5>Generated JavaScript Code</h5></FormLabel>
                                    <AceEditor
                                        mode="javascript"
                                        theme="dracula"
                                        value={this.state.output}
                                        name="OUTPUT"
                                        editorProps={{$blockScrolling: true}}
                                        showPrintMargin={false}
                                        style={{height: 400}}
                                        width="100%"
                                    />
                            </Row>
                        </Content>
                        <Footer style={{textAlign: 'center', background: '#fff'}}>
                            cToJsFunctionsGenerator ©2021
                        </Footer>
                    </Layout>
                )}/>
            </div>
        );
    }
}

export default MainPage;
