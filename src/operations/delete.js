const AWS = require('aws-sdk');
const config = require('../config')
const readlineSync = require('readline-sync');

AWS.config.update({
    accessKeyId: config.AWS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ID,
    region: config.AWS_REGION,
})


const ses = new AWS.SES({apiVersion: '2010-12-01'})

console.log("########### Mantenedor de Plantillas ############")
console.log("##                                             ##")
console.log("##   Operación: Eliminar Plantilla             ##")
console.log("##                                             ##")
console.log("#################################################")

const initDelete = async () => {
    try{
        const templatesResponse = await ses.listTemplates().promise();
        const templates = templatesResponse.TemplatesMetadata;
        let selectedTemplate = "";
        let isSelectedTemplate= false;

        while(!isSelectedTemplate){
            console.log("\nElija una de las siguientes plantillas");
            templates.forEach((template, key) => {
                console.log(`${key+1}) ${template.Name}`)
            })
            var selectedOption = readlineSync.questionInt("Opción : \n")
        
            if(selectedOption === "" || selectedOption > templates.length){
                console.log("Opción elegida no existe")
            }else{
                isSelectedTemplate = true;
                
                selectedTemplate = templates[selectedOption-1].Name;
                console.log(selectedTemplate)
            }
        }

        await ses.deleteTemplate({TemplateName: selectedTemplate}).promise();
        
    }catch(err){
        console.error(err, err.stack);
    }
}

initDelete();