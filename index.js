/*var tty=require('serialport').SerialPort;
var ama0=new tty('/dev/ttyAMA0', {baudrate:115200}, false);
ama0.open(function(err){
    if(err)
    {
        console.error(err);
        return;
    }
    
    ama0.once('data', function(data){
        if(data.readUInt16BE(7)==327)
        {
            if(typeof($)=='undefined')
                console.log('razberry');
            else
            {
                $.device({type:'.zwave', category:'zwave', name:razberry, address:'/dev/ttyAMA0'});
            }
        }
        ama0.close(function(err){
            if(err)
            {
                console.error(err);
                return;
            }
        });
    })
    
    ama0.write(new Buffer([0x01, 0x03, 0x00, 0x07, 0xFB]), function(error, result)
    {
        if(error)
        {
            console.error(error);
            ama0.close(function(err){
                if(err)
                    console.error(err);
            });
        }   
    });
});*/
//.device({type:'.sq-blaster', category:'sq-blaster', name:service.host, ip:service.addresses});

            var nodes={};
            var zwave=require('./scanner.js')('/dev/ttyAMA0', {
                disconnect:function()
                {
                    console.log('disconnected');
                    console.log(arguments);
                },
                nodeAdded:function(nodeId) {
                    nodes[nodeId]= {
                        manufacturer: '',
                        manufacturerid: '',
                        product: '',
                        producttype: '',
                        productid: '',
                        type: '',
                        name: '',
                        loc: '',
                        classes: {},
                        ready: false,
                    };
               },
               
                nodeReady:function(nodeid, nodeinfo) {
                    nodes[nodeid].manufacturer = nodeinfo.manufacturer;
                    nodes[nodeid].manufacturerid = nodeinfo.manufacturerid;
                    nodes[nodeid].product = nodeinfo.product;
                    nodes[nodeid].producttype = nodeinfo.producttype;
                    nodes[nodeid].productid = nodeinfo.productid;
                    nodes[nodeid].type = nodeinfo.type;
                    nodes[nodeid].name = nodeinfo.name;
                    nodes[nodeid].loc = nodeinfo.loc;
                    nodes[nodeid].ready = true;
                    console.log('node%d: %s, %s', nodeid,
                            nodeinfo.manufacturer ? nodeinfo.manufacturer
                                      : 'id=' + nodeinfo.manufacturerid,
                            nodeinfo.product ? nodeinfo.product
                                     : 'product=' + nodeinfo.productid +
                                       ', type=' + nodeinfo.producttype);
                    console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
                            nodeinfo.name,
                            nodeinfo.type,
                            nodeinfo.loc);
                    for (comclass in nodes[nodeid].classes) {
                        switch (comclass) {
                        case 0x25: // COMMAND_CLASS_SWITCH_BINARY
                        case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
                            zwave.enablePoll(nodeid, comclass);
                            break;
                        }
                        var values = nodes[nodeid].classes[comclass];
                        console.log('node%d: class %d', nodeid, comclass);
                        for (idx in values)
                            console.log('node%d:   %s=%s', nodeid, values[idx].label, values[idx].value);
                    }
                    //$.device(nodes[nodeid]);
                },
                valueAdded:function(nodeid, comclass, value) {
                    if (!nodes[nodeid].classes[comclass])
                        nodes[nodeid].classes[comclass] = {};
                    nodes[nodeid].classes[comclass][value.index] = value;
                },
                valueChanged:function(nodeid, comclass, value) {
                    if (nodes[nodeid].ready) {
                        console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
                                value.label,
                                nodes[nodeid].classes[comclass][value.index].value,
                                value.value);
                    }
                    nodes[nodeid].classes[comclass][value.index] = value;
                },
                valueRemoved:function(nodeid, comclass, index) {
                    if (nodes[nodeid].classes[comclass] &&
                        nodes[nodeid].classes[comclass][index])
                        delete nodes[nodeid].classes[comclass][index];
                },
                notification: function(nodeid, notif) {
                    switch (notif) {
                        case 0:
                            console.log('node%d: message complete', nodeid);
                            break;
                        case 1:
                            console.log('node%d: timeout', nodeid);
                            break;
                        case 2:
                            console.log('node%d: nop', nodeid);
                            break;
                        case 3:
                            console.log('node%d: node awake', nodeid);
                            break;
                        case 4:
                            console.log('node%d: node sleep', nodeid);
                            break;
                        case 5:
                            console.log('node%d: node dead', nodeid);
                            break;
                        case 6:
                            console.log('node%d: node alive', nodeid);
                            break;
                        case 20:
                            console.log(arguments);
                            break;
                    }
                },
            });
            
            if(typeof($)=='undefined')
            {
                process.on('SIGINT', function() {
                    console.log('disconnecting...');
                    zwave.disconnect();
                    process.exit();
                });
            }