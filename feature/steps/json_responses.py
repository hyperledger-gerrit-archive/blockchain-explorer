import trafaret as t

"""
Example of using Trafaret (https://github.com/Deepwalker/trafaret) to describe json response structure

Assuming our json is:

{
   "access_token":"access_token",
   "refresh_token":"refresh_token",
   "token_type":"token_type",
   "expires_in":1800
}

Our trafaret will be:

tokenData = t.Dict({
    t.Key('access_token'): t.String,
    t.Key('refresh_token'): t.String,
    t.Key('token_type'): t.String,
    t.Key('expires_in'): t.Int
})
"""

# Below are objects used for validating response in explorer.feature
userData = t.Dict({
    t.Key('message'): t.String,
    t.Key('name'): t.String
})

loginResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('success'): t.Bool,
    t.Key('message'): t.String,
    t.Key('token'): t.String,
    t.Key('user'): userData
})

channelsResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('channels'): t.List(t.String)
})
