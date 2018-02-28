import React from 'react';
import { Table, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
const Channels = ({ channelList }) => {
    return (
        <div>
            <Table>
                <thead>
                    <th>Channel Id</th>
                </thead>
                <tbody>
                    {channelList.map(channel=>
                    <tr key={channel.channel_id}>
                        <td>{channel.channel_id} </td>
                    </tr>)}
                </tbody>
            </Table>
        </div>
    );
};
export default Channels;