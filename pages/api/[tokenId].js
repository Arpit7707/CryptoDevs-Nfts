//making a generic api endpoint to make tokenURI

//tokenURI = Base URI + tokenId
//Base URI = https://crypto-devs-nfts-omega.vercel.app/api/
//tokenID = 1
//resultant tokenURI : https://example.com/1

export default function handler(req, res) {
  //<---------------Explaination of code written below---------------->
  //   //in [tokenId].js tokenId acts as variable and we can get access of that variable by below line ( req.query.tokenId )
  //    we can get tokenId from file name which is query parameter for this query file
  //   //so if we search "localhost:3000/api/1" the response will be json like this: {'tokenId': 1}
  //Code:
  //   const tokenId = req.query.tokenId
  //   res.status(200).json({
  //     tokenId : tokenId,
  //   })

  const tokenId = req.query.tokenId;
  const name = `Crypto Dev #${tokenId}`;
  const description = "Crypto Dev is a collection of developers in crypto";
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/
                ${Number(tokenId) - 1}.svg`;

  return res.status(200).json({
    name: name,
    description: description,
    image: image,
  });
}
