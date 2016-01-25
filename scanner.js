var OpenZWave = require('openzwave');

module.exports=function(controllerPath, options)
{
    var zwave = new OpenZWave(controllerPath, {
        saveconfig: true,
    });
    
    zwave.on('driver ready', function(homeid) {
        console.log('scanning homeid=0x%s...', homeid.toString(16));
    });
    
    zwave.on('driver failed', function() {
        console.log('failed to start driver');
        console.log(arguments);
        zwave.disconnect();
    });
    
    if(options.nodeAdded)
        zwave.on('node added', options.nodeAdded);
    
    if(options.valueAdded)
        zwave.on('value added', options.valueAdded);
    
    if(options.valueChanged)
        zwave.on('value changed', options.valueChanged);
    
    if(options.valueRemoved)
        zwave.on('value removed', options.valueRemoved);
    
    if(options.nodeReady)
        zwave.on('node ready', options.nodeReady);
    
    if(options.notification)
        zwave.on('notification', options.notification);

    zwave.on('scan complete', function(){
        console.log('scan completed');
    });

    zwave.connect(); 
    
    return zwave;
};