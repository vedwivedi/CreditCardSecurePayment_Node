exports.RB=async function (Say, Listen, Remember, Collect, Tasks, Redirect, Handoff, callback) {
    
  console.log("responseBuilder");
  
  
  let responseObject = {
      actions: [],
    };
  
    if (Say) {
      responseObject.actions.push({
        say: {
          speech: Say,
        },
      });
    }
  
    if ( Listen ) {
      responseObject.actions.push(
              { 
                   "listen":Listen
              }
      );
    }
  
    if (Remember) {
      responseObject.actions.push({
        remember: Remember,
      });
    }
  
    if (Collect) {
      responseObject.actions.push({
        collect: Collect,
      });
    }
  
    if (Redirect) {
      responseObject.actions.push({
        redirect: Redirect,
      });
    }
  
    if (Handoff) {
      if (Handoff.type === 1) {
        responseObject.actions.push({
          handoff: {
            channel: 'voice',
            uri: Handoff.twiml_url,
            method: 'POST',
          },
        });
      } else if (Handoff.type === 2) {
        responseObject.actions.push({
          handoff: {
            channel: 'voice',
            uri: Handoff.task_router_url,
            wait_url: Handoff.wait_url,
            wait_url_method: Handoff.wait_url_method,
          },
        });
      }

    }

console.log(JSON.stringify(responseObject));
//console.log("Say: "+Say +"Listen: "+ Listen +"Remember: "+ Remember+ "Collect: "+Collect+"Tasks: " +Tasks+ "Redirect: "+Redirect+ "Handoff: "+ Handoff);
callback(null, responseObject);
}