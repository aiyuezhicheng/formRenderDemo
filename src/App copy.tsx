import FormRender, { useForm } from 'form-render';
import type { SchemaBase } from 'form-render';
import React, { useEffect, useState } from 'react';

function App() {
  const form = useForm();
  const [schema, setSchema] = useState<SchemaBase>({
    "type": "object",
    "labelWidth": 120,
    "displayType": "row",
    "properties": {}
  });  

  const getCustomFormValueAndSendMessage = (e: MessageEvent<any>) => {
    const formValue = form.getFieldsValue();
    const taskGroupPropertyValues = [];
    const collectType = e.data.collectType
    for (let id in formValue) {
      const oneProperty = form.getSchemaByPath(id);
      if (oneProperty) {
        let obj: any = { Value: formValue[id] + '' };
        if (collectType == 'IDAndValueTypeAndValueFormat') {
          if (oneProperty.ID) {
            obj.ID = oneProperty.ID;
            obj.ValueType = oneProperty.ValueType;
            obj.ValueFormat = oneProperty.ValueFormat;
            taskGroupPropertyValues.push(obj);
          }
        } else {
          const editTemplatePropertyID = oneProperty.editTemplatePropertyID
          if (editTemplatePropertyID)
            obj.EditTemplatePropertyID = editTemplatePropertyID;
          if (obj.EditTemplatePropertyID)
            taskGroupPropertyValues.push(obj);
        }
      }
    }
    let data = { 'type': 'setCustomFormPropertyValue', 'taskGroupPropertyValues': taskGroupPropertyValues };
    window.top && window.top.postMessage(data, '*')
  }

  const validateCustomFormValueAndSendMessage = () => {
    console.log('要验证')
    console.log(form.getFieldsValue())

    form.validateFields().then((values: any) => {
      let data = { 'type': 'completeValidateCustomFormValue', 'errorMsg': '', isPassValid: true };
      window.top && window.top.postMessage(data, '*')
    }).catch((errorInfo: { errorFields: { errors: any[]; }[]; }) => {
      let errorMsg = '';
      if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
        errorInfo.errorFields.forEach((item: { errors: any[]; }, index: number) => {
          if (item.errors && item.errors.length > 0) {
            if (errorMsg && index != 0 && index != errorInfo.errorFields.length - 1)
              errorMsg += ','
            errorMsg += item.errors.join(',');
          }
        })
      }
      let data = { 'type': 'completeValidateCustomFormValue', 'errorMsg': errorMsg, isPassValid: false };
      window.top && window.top.postMessage(data, '*')
    })
  }

  // 接收消息
  const receiveMessage = (e: MessageEvent<any>) => {
    if (e.data.type == 'setCustomFormSchema') {
      console.log('12321')
      setSchema(e.data.schema)
      document.body.clientHeight
    } else if (e.data.type == 'getCustomFormValue') {
      getCustomFormValueAndSendMessage(e)
    } else if (e.data.type == 'validateCustomFormValue') {
      validateCustomFormValueAndSendMessage()
    } else if (e.data.type == 'getCustomFormIframeHeight') {
      // document
      console.log(111)
    }
  }



  useEffect(() => {
    window.onmessage = null;
    window.onmessage = function (e) {
      receiveMessage(e);
    }
    // window.addEventListener('message', function (e) {
    //   receiveMessage(e);
    // }, true);
  }, [])


  return (

    <FormRender
      form={form}
      schema={schema}
      configProvider={{
        theme: {
          token: {
            colorPrimary: '#ffa900',
          },
        }
      }}
    />
  );
}

export default App;
