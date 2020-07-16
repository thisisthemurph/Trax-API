# Trax API

This is the backend API for the Trax application.
For the fornt end code, visit the [Git Repo](https://github.com/thisisthemurph/Trax)

## Authentication

Your auth token is to be included in the header of all requests. examples detailed below assume this header has been included.

| Header       | Value                                                                                                               |
| :----------- | :------------------------------------------------------------------------------------------------------------------ |
| `auth-token` | `ExaMpleAuthToken.eyJfaWQiOiI1ZWE4MWM3_yI6YQqRhNTQiLCJpYXQiOjEyMReWZF2NjN9.EP_yI6YQqqUjdXsIZyMReWZglkOgtws_jdXsIZy` |

## Get a specific Track

```http
GET http://localhost:5000/trax/api/tracks/<RESOURCE_ID>
```

| Param         | Description                        |
| :------------ | :--------------------------------- |
| <RESOURCE_ID> | **Required** - the ID of the Track |

### Example Request

```http
GET http://localhost:5000/trax/api/tracks/5ec2a7d310bc4f062adff627
```

### Example Response

```json
{
	"success": true,
	"track": {
		"_id": "5ec2a7d310bc4f062adff627",
		"type": "weight",
		"name": "Squats",
		"data": {
			"metric": "g",
			"increaseOrDecrease": "decrease",
			"dataPoints": [
				{
					"timestamp": "2020-06-05T00:00:00.000Z",
					"_id": "5eda5b3af8499e0166f35978",
					"value": 1
				},
				{
					"timestamp": "2020-06-05T00:00:00.000Z",
					"_id": "5eda5b3df8499e0166f35979",
					"value": 1
				}
			],
			"target": null
		},
		"createdAt": "2020-05-18T15:20:51.383Z",
		"updatedAt": "2020-06-08T07:28:44.220Z"
	}
}
```

<!-- | Parameter    | Type      | Description                                                                                                                      |
| :----------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `success`    | `boolean` | Indication of success                                                                                                            |
| `track`      | `object`  | The object detailing the Track. <br>_This may not be present if there were any errors during the location of the specific Track_ |
| `track._id`  | `string`  | Unique identifier for the returned Track                                                                                         |
| `track.type` | `string`  | Details the type of data being tracked                                                                                           |
| `track.name` | `string`  | The name of the track                                                                                                            |
| `caretedAt`  | `string`  | ISO timestamp - created                                                                                                          |
| `updatedAt`  | `string`  | ISO timestamp - updated                                                                                                          | -->
