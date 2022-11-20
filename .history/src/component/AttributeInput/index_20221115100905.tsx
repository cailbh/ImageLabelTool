import React from 'react'
import './index.css';

import url_confirm from "../../assets/imgs/confirm.png"
import url_addAttr from "../../assets/imgs/addAttr.svg"
import url_delAttr from "../../assets/imgs/delAttr.png"
interface AttributeInputProps {
    name: string;
    changeName: any;
    confirm: any;
    attributes: any;
    changeAttributes: any;
    children?: React.ReactNode;
}
interface AttributeInputState {
    name: string;
    attributes: any;
    // displayAttributeInputPicker: boolean;
    // color: object;
}
export default class AttributeInput extends React.Component<AttributeInputProps, AttributeInputState> {
    state = {
        name: '',
        attributes: []
    };
    constructor(props: AttributeInputProps) {
        super(props)
        this.state = {
            name: props.name,
            attributes: props.attributes
        }
        this.setState(this.state)
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if ((nextProps.attributes !== prevState.attributes) || (nextProps.name !== prevState.name)) {
            return {
                name: nextProps.name,
                attributes: nextProps.attributes
            }
        }
        return null
    }

    confirm = ()=>{
        let input = document.getElementById("nameIn") as HTMLInputElement
        input.value = ""
        this.props.confirm()
    }

    nameChange = (e, tp) => {
        this.props.changeName(e.target.value)
    }

    attrChange = (e, index, type) => {
        var tp = this.state.attributes[index]
        var temp = this.state.attributes
        tp[type] = e.target.value
        this.state = {
            name: this.state.name,
            attributes: this.state.attributes
        }
        this.setState(this.state)
        this.props.changeAttributes(this.state.attributes)
    }
    nameInput = (data: string) => {
        return (
            <div className='attrValue'>
                <input id="nameIn" type="text" className="valueInput" placeholder={data} onChange={(e) => this.nameChange(e, "name")} />
            </div>
        )
    }
    attrInput = (data: any[]) => {
        if (data) {
            return (
                <div className="attrInputDiv">
                    {
                        data.map((item, index) => {
                            return (
                                <div className="attrInput" >
                                    <div className="attrKey">
                                        <input type="text" className={"keyInput attr" + index}  placeholder={item.attrKey}  onChange={(e) => this.attrChange(e, index, "attrKey")} />
                                    </div>
                                    <div className='attrValue'>
                                        <input type="text" className={"valueInput attr" + index} placeholder={item.attrValue} onChange={(e) => this.attrChange(e, index, "attrValue")} />
                                    </div>
                                    
                                    <div className={'attrDel '+index} onClick={(e) => { this.delAttr(e) }}>
                                        <img className={"delAttrBut "+index} src={url_delAttr}></img>
                                    </div>
                                </div>
                            )
                        })
                    }

                    <div className="attrInput" >
                        <div className="addAttr" onClick={(e) => { this.addAttr() }}>
                            <img className="addAttrBut" src={url_addAttr}></img>
                        </div>
                    </div>
                </div>
            )
        }
    }
    addAttr = () => {
        var tp = {}
        var temp = this.state.attributes
        temp.push(tp)
        this.state = {
            name: this.state.name,
            attributes: temp
        }
        this.setState(this.state)

    }
    delAttr = (e) => {
        console.log(e,e.target,e.target.className)
        let str = e.target.className
        let index = str.split(' ')[1]
        var temp = this.state.attributes
        temp.splice(index, 1)
        this.state = {
            name: this.state.name,
            attributes: temp
        }
        this.setState(this.state)

    }
    // handleClick = () => {
    //     this.setState({ displayAttributeInputPicker: !this.state.displayAttributeInputPicker })
    // };

    // handleClose = () => {
    //     this.setState({ displayAttributeInputPicker: false })
    // };

    // handleChange = (color) => {
    //     this.setState({ color: color.rgb })
    //     this.props.changeAttributeInput(color)
    // };
    // useEffect(() => {
    //     this.state = {
    //         name: props.name,
    //         attributes: props.attributes
    //     }
    //     this.setState(this.state)
    // }, [this.props])

    render() {
        const data = this.props
        return (
            <div className='contain'>
                {/* <div className="attrHead">
                    <div className="headName">Entity Editing</div>
                </div> */}
                <div className="nameInput" >
                    <div className="attrKey">
                        {/* <div>名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称：</div> */}
                        Name：
                    </div>

                    {this.nameInput(this.state.name)}
                </div>
                {this.attrInput(this.state.attributes)}
                <div className='confirmDiv'onClick={() => { this.confirm() }}></div>
            </div>
        )
    }
}
