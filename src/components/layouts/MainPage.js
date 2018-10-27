import React from "react";
import {Link, Route} from 'react-router-dom';
import {Col, Layout, Row} from 'antd';
import {ControlLabel, FormControl, FormGroup} from "react-bootstrap";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import {callFunction, getCwrapParams, getEmscriptenType, getReturnLine, paramsInit} from "../helpers/helpers";

const {Header, Content, Footer} = Layout;

class MainPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);
        this.getIn = this.getIn.bind(this);
        this.generateOutput = this.generateOutput.bind(this);

        this.state = {
            input: "",
            inFunctionReturnType: "",
            inFunctionName: "",
            inFunctionParameters: [],
            output: ""
        };
    }

    handleChange(e) {
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
        let beigning = "export default function " + this.state.inFunctionName + "(parametersInMap) {\n";
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

    render() {
        return (
            <div>
                <Route exact={true} path={"/"} render={() => (
                    <Layout className="layout">
                        {/*LOGO*/}
                        {/*<Header style={{background: "#fff", height: "200px"}}>*/}
                        {/*<Row type='flex' gutter={8} align="center">*/}
                        {/*<Col>*/}
                        {/*<img src={logo} align="center" className="App-logo" alt="logo"/>*/}
                        {/*</Col>*/}
                        {/*</Row>*/}
                        {/*</Header>*/}
                        <Content style={{padding: '0 75px', background: '#fff'}}>
                            <Row key={1} align="center" style={{paddingBottom: 25}}>

                                {/*INPUT*/}
                                <FormGroup controlId="formBasicText1">
                                    <ControlLabel>Working example with validation</ControlLabel>
                                    <FormControl
                                        componentClass="textarea"
                                        placeholder="Enter text"
                                        onChange={this.handleChange}
                                    />
                                    <FormControl.Feedback/>
                                    <HelpBlock>Validation is based on string length.</HelpBlock>
                                </FormGroup>
                            </Row>

                            <button onClick={this._downloadTxtFile}>Download file</button>

                            <Row key={2} align="center" style={{paddingBottom: 25}}>
                                {/*OUTPUT*/}
                                <FormGroup controlId="formBasicText2">
                                    <ControlLabel>Working example with validation</ControlLabel>
                                    <FormControl
                                        componentClass="textarea"
                                        value={this.state.output}
                                        placeholder="Enter text"
                                        style={{height: 400}}
                                        disabled={true}
                                    />
                                    <FormControl.Feedback/>
                                    <HelpBlock>Validation is based on string length.</HelpBlock>
                                </FormGroup>
                            </Row>
                        </Content>
                        <Footer style={{textAlign: 'center', background: '#fff'}}>
                            cToJsFunctionsGenerator
                        </Footer>
                    </Layout>
                )}/>
            </div>
        );
    }
}

export default MainPage;
