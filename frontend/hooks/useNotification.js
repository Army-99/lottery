import { useNotification } from '@web3uikit/core';


const handleSuccessNotification = (dispatch) => {
    dispatch({
        type: "info",
        message: "Transaction Complete!",
        title: "Tx Notification",
        position: "topR",
        icon: <Bell fontSize={20}/>
    })
}


/* SUCCESS */

