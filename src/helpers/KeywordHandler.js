import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function addKeywordsToProduct(req, res) {
  const { productId, keywords } = req.body;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const createdKeywords = [];

    for (const keywordName of keywords) {
      let keyword = await prisma.keyword.findUnique({
        where: { name: keywordName },
      });

      if (!keyword) {
        keyword = await prisma.keyword.create({
          data: { name: keywordName },
        });
      }

      const productKeyword = await prisma.productKeyword.create({
        data: {
          productId: product.id,
          keywordId: keyword.id,
        },
      });

      createdKeywords.push(productKeyword);
    }

    return res.status(201).json({ message: "Keywords added successfully", createdKeywords });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  addKeywordsToProduct,
};
