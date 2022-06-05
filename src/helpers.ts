import { ValidationError } from "yup";
import HttpError from "./HttpError";
import { headers } from "./handlers";

export const tableName = "ProductsTable";

export const fetchProductById = async (docClient: AWS.DynamoDB.DocumentClient, id?: string) => {
  const output = await docClient.get({ TableName: tableName, Key: { productID: id } }).promise();
  if (!output.Item || !id) {
    throw new HttpError(404, { error: "Item not found or id is not valid" });
  }
  return output.Item;
};

export const handleError = (e: unknown) => {
  if (e instanceof ValidationError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        errors: e.errors,
      }),
    };
  }
  if (e instanceof SyntaxError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request body format: " + e.message }),
    };
  }

  if (e instanceof HttpError) {
    return {
      statusCode: e.statusCode,
      headers,
      body: e.message,
    };
  }
  throw e;
};
