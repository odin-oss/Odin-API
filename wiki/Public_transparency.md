# Public transparency

We need to be careful on datas we send to public. Certains informations needs to remain secret for commercial reasons.

## Informations concerning applications

There is a specific format for public client, it gives another Application format in order to keep specifications secret :

Here is the public format :
```json
{
  interfaces: [
    {
      label: 'SSHTerm',
      link: 'https://api.crrs.cloud/shrek-fiona-donkey/cisshtermhash123000/',
      service: 'Terminal'
    }
  ],
  label: 'Linux Alpine 3.19'
}
```

With the link on Odin's front-end, the client will be able to access his application without needing more informations.

