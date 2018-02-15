import React from 'react';
import {Table, Button } from 'reactstrap';
import {Link} from 'react-router-dom';

const BlockList = ({blockList}) => {

    console.log(blockList);

    return(
        <div>
            <Table striped bodered condensed hover>
                <thead>
                    <tr>
                        <th>Block Number</th>
                        <th>Data Hash</th>
                        <th>Pre Hash</th>
                        <th>Transaction Count</th>
                    </tr>
                </thead>
                <tbody>
                 {blockList.map(block =>
                    <tr key={block.server_hostname} >
                        <td>{block.server_hostname} </td>
                    </tr>
                    )} 
                </tbody>
            </Table>
        </div>
    );

};

export default BlockList;