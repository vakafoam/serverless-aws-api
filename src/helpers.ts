import HttpError from "./HttpError";

export const tableName = "ProductsTable";

export const fetchProductById = async (docClient: AWS.DynamoDB.DocumentClient, id?: string) => {
  const output = await docClient.get({ TableName: tableName, Key: { productID: id } }).promise();
  if (!output.Item || !id) {
    throw new HttpError(404, { error: "Item not found or id is not valid" });
  }
  return output.Item;
};

export const handleError = (e: unknown) => {
  if (e instanceof HttpError) {
    return {
      statusCode: e.statusCode,
      body: e.message,
    };
  }
  throw e;
};
