import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "ProductsTable";

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);
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
      body: JSON.stringify(product),
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify(e),
    };
  }
};

export const getProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const output = await docClient
    .get({
      TableName: tableName,
      Key: {
        productID: id,
      },
    })
    .promise();

  if (!output.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Item not found" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(output.Item),
  };
};

// call 'serverless deploy' to deploy the function
// POST - https://oj96k0r9v9.execute-api.us-east-1.amazonaws.com/product
// GET - https://oj96k0r9v9.execute-api.us-east-1.amazonaws.com/product/{id}
