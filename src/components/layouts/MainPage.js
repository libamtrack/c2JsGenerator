import React from "react";
import {Link, Route} from 'react-router-dom';
import {Col, Layout, Row} from 'antd';
import {ControlLabel, FormControl, FormGroup} from "react-bootstrap";
import HelpBlock from "react-bootstrap/es/HelpBlock";

const {Header, Content, Footer} = Layout;

class MainPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);

        this.state = {
            input: "",
            output: ""
        };
    }

    handleChange(e) {
        this.setState({input: e.target.value});
        this.setState({output: e.target.value});
        console.log(this.state.input);
    }

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
                            <Row key={1} type='flex' gutter={10} align="center" style={{paddingBottom: 25}}>

                                {/*INPUT*/}
                                <Col span={10}>
                                    <FormGroup controlId="formBasicText1">
                                        <ControlLabel>Working example with validation</ControlLabel>
                                        <FormControl
                                            componentClass="textarea"
                                            placeholder="Enter text"
                                            style={{height:400}}
                                            onChange={this.handleChange}
                                        />
                                        <FormControl.Feedback />
                                        <HelpBlock>Validation is based on string length.</HelpBlock>
                                    </FormGroup>
                                </Col>

                                {/*OUTPUT*/}
                                <Col span={10}>
                                    <FormGroup controlId="formBasicText2">
                                        <ControlLabel>Working example with validation</ControlLabel>
                                        <FormControl
                                            componentClass="textarea"
                                            value={this.state.output}
                                            placeholder="Enter text"
                                            style={{height:400}}
                                            disabled={true}
                                        />
                                        <FormControl.Feedback/>
                                        <HelpBlock>Validation is based on string length.</HelpBlock>
                                    </FormGroup>
                                </Col>
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
