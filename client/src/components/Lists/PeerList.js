import React from 'react';
import {Table, Button } from 'reactstrap';
import {Link} from 'react-router-dom';

const PeerList = ({peerList}) => {

    console.log(peerList);

    return(
        <div>
            <Table striped bodered condensed hover>
                <thead>
                    <tr>
                        <th>Peer Name</th>
                    </tr>
                </thead>
                <tbody>
                 {peerList.map(peer =>
                    <tr key={peer.server_hostname} >
                        <td>{peer.server_hostname} </td>
                    </tr>
                    )} 
                </tbody>
            </Table>
        </div>
    );

};

export default PeerList;