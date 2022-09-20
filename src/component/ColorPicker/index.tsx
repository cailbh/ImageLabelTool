import React from 'react'
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'

interface ColorProps {
    color: string;
    changeColor: any;
    children?: React.ReactNode;
}
interface ColorState {
    displayColorPicker: boolean;
    color: object;
}
export default class ColorPicker extends React.Component<ColorProps, ColorState> {
    state = {
        displayColorPicker: false,
        color: {
            r: '241',
            g: '112',
            b: '19',
            a: '1',
        },
    };
    constructor(props: ColorProps) {
        super(props)
        let rgblist = ["0", "0", "0", "1"]
        let col = props.color.split(",")
        for (var c in col) {
            var n = col[c].replace(/[^0-9]/ig, "");
            rgblist[c] = n + ""
        }
        const color = {
            r: rgblist[0],
            g: rgblist[1],
            b: rgblist[2],
            a: rgblist[3],
        }
        this.state = {
            displayColorPicker: false,
            color: color
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.color !== prevState.color) {
            let rgblist = ["0", "0", "0", "1"]
            let col = nextProps.color.split(",")
            for (var c in col) {
                var n = col[c].replace(/[^0-9]/ig, "");
                rgblist[c] = n + ""
            }
            const color = {
                r: rgblist[0],
                g: rgblist[1],
                b: rgblist[2],
                a: rgblist[3],
            }
            return { color: color }
        }
        return null
    }


    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    handleChange = (color) => {
        this.setState({ color: color.rgb })
        this.props.changeColor(color)
    };

    render() {
        const data = this.props
        const styles = reactCSS({
            'default': {
                color: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`,
                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });

        return (
            <div>
                <div style={styles.swatch} onClick={this.handleClick}>
                    <div style={styles.color} />
                </div>
                {this.state.displayColorPicker ? <div style={styles.popover}>
                    <div style={styles.cover} onClick={this.handleClose} />
                    <SketchPicker color={this.state.color} onChange={this.handleChange} />
                </div> : null}

            </div>
        )
    }
}
