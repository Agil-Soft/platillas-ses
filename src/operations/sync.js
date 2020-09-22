const fs = require('fs');
const AWS = require('aws-sdk');
const readlineSync = require('readline-sync');
const config = require('../config')

  
AWS.config.update({
    accessKeyId: config.AWS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ID,
    region: config.AWS_REGION,
})

const ses = new AWS.SES({apiVersion: '2010-12-01'})

console.log("########### Mantenedor de Plantillas ############")
console.log("##                                             ##")
console.log("##   Operación: Subir o Actualizar Plantilla   ##")
console.log("##                                             ##")
console.log("#################################################")

const filesSearch = fs.readdirSync("./src/templates");
const files = filesSearch.filter((file) => file.split('.')[1] === "html");

let selectedFile = "";
let isSelectedFile = false;

while(!isSelectedFile){
    console.log("\nElija una de las siguientes plantillas");
    files.forEach((file, key) => {
        console.log(`${key+1}) ${file}`)
    })
    var selectedOption = readlineSync.questionInt("Opción : \n")

    if(selectedOption === "" || selectedOption > files.length){
        console.log("Opción elegida no existe")
    }else{
        isSelectedFile = true;
        selectedFile = files[selectedOption-1];
    }
}



const file = fs.readFileSync(`./src/templates/${selectedFile}`);
const templateName = selectedFile.replace(" ", "").split(".")[0];
const jsonConf = require(`../templates/${templateName}.json`);
console.log(`Configurando Plantilla ${templateName}`);

const params = {
    Template : {
        TemplateName : templateName,
        SubjectPart: jsonConf.subject,
        HtmlPart: file.toString(),
    }
}

const createOrUpdateTemplate = async (params) => {
    let searchTemplate = null;
    try{
        searchTemplate = await ses.getTemplate({TemplateName: params.Template.TemplateName}).promise();
    }catch(err){
        console.log("No existe")
    }

    try{
        if(searchTemplate){
            await ses.updateTemplate(params).promise();
            console.log(`Plantilla ${params.Template.TemplateName} Actualizada Correctamente`)
        }else{
            await ses.createTemplate(params).promise();
            console.log(`Plantilla ${params.Template.TemplateName} Creada Correctamente`)
        }
        
    }catch(err){
        console.error(err, err.stack);
    }
}

createOrUpdateTemplate(params);

