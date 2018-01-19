import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';



class BlockCharts extends Component {
  constructor(props) {
    super(props);
    //this.blockChartData = this.blockChartData.bind(this);
    this.state = {
      blockChartData: [{  }]
    };
  }
/*
  blockChartData () {
    [];

  }
*/

  render() {
   
    const data = [
      { dtime: '12:16:51 pm ', blks: 3534 },
      { dtime: '12:16:53 pm ', blks: 23567789 },
      { dtime: '12:16:54 pm ', blks: 2367789 },
      { dtime: '12:16:55 pm ', blks: 2356778 },
      { dtime: '12:16:56 pm ', blks: 567789 },
      { dtime: '12:16:57 pm ', blks: 235679 },
      { dtime: '12:17:58 pm ', blks: 235789 },
      { dtime: '12:17:59 pm ', blks: 235677 },
      { dtime: '12:18:01 pm ', blks: 567789 },
      { dtime: '12:18:45 pm ', blks: 3555 },
      { dtime: '12:19:55 pm ', blks: 47458937 },
      { dtime: '12:20:51 pm ', blks: 5 },
      { dtime: '12:21:58 pm ', blks: 7537589 },
      { dtime: '12:22:35 pm ', blks: 77445 },
    ];

    return (
      <div style={{ position: 'absolute', top: 800, left: 50, width: 1190 }}>
        <Card >
          <CardContent >
            <Typography  >BLOCKS/MIN</Typography>
            <LineChart width={1170} height={200} data={data}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis dataKey="dtime" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="natural" dataKey="blks" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </CardContent>
        </Card>
      </div >
    );
  }
}
export default BlockCharts;