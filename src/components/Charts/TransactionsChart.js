import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card, { CardContent } from 'material-ui/Card';
//import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

class TransactionsCharts extends Component {
  constructor(props) {
    super(props);
    //this.transactionChartData = this.transactionChartData.bind(this);
    this.state = {
      transactionChartData: [{}]
    };
  }
/*
  transactionChartData() {
    [{}];

  }*/


  render() {
    const data = [
      { dtime: '12:16:51 pm ', tx: 3534 },
      { dtime: '12:17:53 pm ', tx: 23567789 },
      { dtime: '12:18:45 pm ', tx: 3555 },
      { dtime: '12:19:55 pm ', tx: 47458937 },
      { dtime: '12:20:51 pm ', tx: 5 },
      { dtime: '12:21:58 pm ', tx: 7537589 },
      { dtime: '12:22:35 pm ', tx: 77445 },
    ];

    return (
      <div style={{ position: 'absolute', top: 530, left: 50, width: 1190 }}>
        <Card >
          <CardContent>
            <Typography >TRANSACTIONS/MIN</Typography>
            <LineChart width={1170} height={200} data={data}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis dataKey="dtime" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="tx" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </CardContent>
        </Card>
      </div >
    );
  }
}
export default TransactionsCharts;