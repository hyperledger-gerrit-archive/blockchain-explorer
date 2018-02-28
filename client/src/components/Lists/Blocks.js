import React from 'react';
import { Table, Button, Container, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { getBlockInfo } from '../../store/actions/block/action-creators'
import store from '../../store/index';

const Blocks = ({ blockList, block, transaction, getBlockInfo, getTransactionInfo }) => {
    // console.log(block.transactions[0]);
    // console.log(block.transactions[0].payload.header.channel_header.tx_id );
    return (
        <div className="blockPage">
            <Container>
                <Row>
                    <Col xs="6" >
                        <h6>BLOCKS</h6>
                        <div className="scrollTable" >
                            <Table id="blockList">
                                <thead className='fixed-header'>
                                    <tr>
                                        <th>Block Number</th>
                                        <th>Number of Tx</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blockList.map(block =>
                                        <tr key={block.blocknum} onClick={() => selectBlock(block.blocknum)}>
                                            <td>  <a href="#">{block.blocknum}</a> </td>
                                            <td>{block.txcount} </td>
                                        </tr>)}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                    <Col xs="6" >
                        <div >
                            <h6>BLOCK DETAIL</h6>
                            <Table id="blockDetails">
                                <tbody>
                                    <tr>
                                        <th>Block Number</th>
                                        <td >{block.number} </td>
                                    </tr>
                                    <tr>
                                        <th>Data</th>
                                        <td >{block.data_hash} </td>
                                    </tr>
                                    <tr>
                                        <th>Previous Hash</th>
                                        <td>{block.previous_hash} </td>
                                    </tr>
                                    <tr>
                                        <th>Transactions</th>
                                        <td>
                                            <ul>
                                                {block.transactions.map(tid =>
                                                    <li onClick={() => selectTransaction(tid.payload.header.channel_header.tx_id)} key={tid.payload.header.channel_header.tx_id} >
                                                        <a href="#">  {tid.payload.header.channel_header.tx_id}</a>
                                                    </li>)
                                                 }
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                        <div>
                            <h6>TRANSACTION DETAIL</h6>
                            <Table id="txDetails">

                                <tbody>
                                    <tr>
                                        <th>Transaction Id</th>
                                        <td >{transaction.tx_id} </td>
                                    </tr>
                                    <tr>
                                        <th>Timestamp</th>
                                        <td >{transaction.timestamp} </td>
                                    </tr>
                                    <tr>
                                        <th>Channel</th>
                                        <td>{transaction.channel_id} </td>
                                    </tr>
                                    <tr>
                                        <th>Type</th>
                                        <td>{transaction.type} </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
    function selectBlock(blocknum) {
        getBlockInfo(blocknum);
    }
    function selectTransaction(tx_id) {
        getTransactionInfo(tx_id);
    }
};
export default Blocks;