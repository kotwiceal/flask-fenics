import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Plot from 'react-plotly.js'
import {PlaceholderPattern} from './toolkit'

const Manager = (prop) => {

    const free = {x: [], y: []}
    const active = {x: [], y: []} 

    prop.manager.free.map((value, index) => {
        if (value) {
            free.x.push(index)
            free.y.push(1)
        } else {
            active.x.push(index)
            active.y.push(1)
        }
    })

    return (
    <>
    <Container md = 'auto'>
        <Row>
            <PlaceholderPattern state = {prop.manager.free.length != 0} xs = {12}
                children = {
                    <Plot
                        data = {[
                            {type: 'bar', x: free.x, y: free.y, name: 'free'},
                            {type: 'bar', x: active.x, y: active.y, name: 'active'}
                        ]}
                        layout = {
                            {
                                plot_bgcolor: '#212529',
                                paper_bgcolor: '#212529',
                                font: {color: '#b4c1d1'},
                                showlegend: true,
                                title: 'Workers state', autosize: true,
                                xaxis: {title: 'workers'},
                                yaxis: {tickmode: 'array', tickvals: [0, 1], ticktext: ['', '']}
                            }
                        }
                        config = {{displayModeBar: false}}
                    />
                }
            />
        </Row>
    </Container>
    </>
    )
}

export {Manager}