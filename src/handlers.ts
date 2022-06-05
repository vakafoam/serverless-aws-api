import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";
import * as yup from "yup";

import { fetchProductById, handleError, tableName } from "./helpers";

const docClient = new AWS.DynamoDB.DocumentClient();
export const headers = {
  "content-type": "application/json",
};

const schema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string().required(),
  price: yup.number().required(),
  available: yup.bool().required(),
});

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);
    await schema.validate(reqBody, { abortEarly: false });

    const product = { ...reqBody, productID: v4() };

    await docClient
      .put({
        TableName: tableName,
        Item: product,
      })
      .promise();
    // ".promise()" method is a part of AWS SDK and it turns entire expression's result (in this case docClient.put(...)) into a javascript Promise object

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(product),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const getProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  try {
    const product = fetchProductById(docClient, id);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const updateProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  try {
    await fetchProductById(docClient, id); // just check if item exists (no error thrown)

    const reqBody = JSON.parse(event.body as string);
    await schema.validate(reqBody, { abortEarly: false });

    const product = { ...reqBody, productID: id };

    await docClient
      .put({
        TableName: tableName,
        Item: product, // it's gonna update the item if id exists
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const deleteProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  try {
    await fetchProductById(docClient, id);
    await docClient
      .delete({
        TableName: tableName,
        Key: {
          productID: id,
        },
      })
      .promise();

    return { statusCode: 204, headers, body: "" };
  } catch (e) {
    return handleError(e);
  }
};

export const listProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const output = await docClient
    .scan({
      TableName: tableName,
    })
    .promise();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(output.Items),
  };
};

// call 'serverless deploy' to deploy the function
// POST - https://oj96k0r9v9.execute-api.us-east-1.amazonaws.com/product
// GET - https://oj96k0r9v9.execute-api.us-east-1.amazonaws.com/product/{id}
