export function makeBatchRequest(web3, calls, callFrom) {
    let batch = new web3.BatchRequest();
    let promises = calls.map(call => {
        return new Promise((resolve, reject) => {
            let request = call.request({from: callFrom}, (error, data) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
            batch.add(request);
        });
    });

    batch.execute();

    return Promise.all(promises);
}