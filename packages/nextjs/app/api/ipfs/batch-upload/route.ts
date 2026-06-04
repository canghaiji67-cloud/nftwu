import { NextRequest, NextResponse } from "next/server";

const PINATA_API_KEY = process.env.PINATA_API_KEY || "your_pinata_api_key_here";
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || "your_pinata_secret_key_here";

// 统一文件名规范：去除BOM/空格/回车，剥离路径，统一小写
const normalizeFileName = (name: string) =>
  (name || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "")
    .trim()
    .replace(/^.*[\\\/]/, "")
    .toLowerCase();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get("csvFile") as File;
    const imageFiles = formData.getAll("imageFiles") as File[];

    if (!csvFile) {
      return NextResponse.json({ success: false, error: "CSV文件是必需的" });
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ success: false, error: "至少需要上传一张图片" });
    }

    // 解析CSV文件（去除BOM与CR，简易解析）
    const csvText = await csvFile.text();

    // 检查是否包含二进制字符（简单的启发式检查：查找空字节）
    // Excel二进制文件(.xls)或压缩文件通常包含空字节，而有效的文本CSV不应该包含
    if (csvText.includes('\0')) {
      return NextResponse.json({ 
        success: false, 
        error: "上传的文件似乎是二进制文件（如Excel .xls/.xlsx）。请确保使用纯文本格式的CSV文件（逗号分隔值）。" 
      });
    }

    const lines = csvText.split("\n").map(l => l.replace(/^\uFEFF/, "").replace(/\r/g, ""));
    if (lines.length === 0 || !lines[0]) {
      return NextResponse.json({ success: false, error: "CSV文件为空或格式不正确" });
    }

    const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
    console.log("Batch Upload - Headers:", headers);

    const nftData: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.trim().length > 0) {
        const values = line.split(",").map(v => v.replace(/"/g, "").trim());
        const nft: any = {};
        headers.forEach((header, index) => {
          nft[header] = values[index] || "";
        });
        // 规范化image_file，兼容路径和大小写
        nft.image_file = normalizeFileName(nft.image_file);
        nftData.push(nft);
      }
    }

    if (nftData.length === 0) {
      return NextResponse.json({ success: false, error: "CSV文件中没有有效数据" });
    }

    // 批量上传图片到Pinata
    const uploadedImages: { [key: string]: string } = {};

    for (const imageFile of imageFiles) {
      const imageFormData = new FormData();
      imageFormData.append("file", imageFile);

      const pinataMetadata = JSON.stringify({
        name: `NFT_Image_${imageFile.name}_${Date.now()}`,
      });
      imageFormData.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      imageFormData.append("pinataOptions", pinataOptions);

      const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
        body: imageFormData,
      });

      if (!pinataResponse.ok) {
        const errorText = await pinataResponse.text();
        console.error("Pinata upload error:", errorText);
        throw new Error(`Failed to upload image ${imageFile.name} to Pinata: ${errorText}`);
      }

      const pinataResult = await pinataResponse.json();
      // 使用公共网关而不是专用网关，以确保图片可以被普遍访问
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;
      // 使用规范化的文件名作为键，避免大小写/路径差异
      uploadedImages[normalizeFileName(imageFile.name)] = imageUrl;
    }

    // 为每个NFT创建元数据并上传到IPFS
    const metadataResults: any[] = [];
    const unmatched: { name: string; image_file: string }[] = [];

    for (const nft of nftData) {
      const key = normalizeFileName(nft.image_file);
      const imageUrl = uploadedImages[key];
      if (!imageUrl) {
        console.warn(`Image file "${nft.image_file}" not found for NFT "${nft.name}". Normalized key: "${key}". Available images: ${Object.keys(uploadedImages).join(', ')}`);
        unmatched.push({ name: nft.name || "", image_file: nft.image_file || "" });
        continue;
      }

      // 构建属性数组
      const attributes = [];
      for (let i = 1; i <= 3; i++) {
        const traitType = nft[`trait_type_${i}`];
        const traitValue = nft[`trait_value_${i}`];
        if (traitType && traitValue) {
          attributes.push({
            trait_type: traitType,
            value: traitValue,
          });
        }
      }

      // 添加默认属性
      attributes.push({
        trait_type: "Batch Upload",
        value: "Excel Import",
      });
      attributes.push({
        trait_type: "Created",
        value: new Date().toISOString().split("T")[0],
      });

      const metadata = {
        name: nft.name,
        description: nft.description || `Custom NFT: ${nft.name}`,
        image: imageUrl,
        attributes: attributes,
      };

      // 上传元数据到Pinata
      const metadataResponse = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `${nft.name}-metadata.json`,
          },
        }),
      });

      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text();
        console.error("Metadata upload error:", errorText);
        throw new Error(`Failed to upload metadata for ${nft.name} to Pinata: ${errorText}`);
      }

      const metadataResult = await metadataResponse.json();
      metadataResults.push({
        name: nft.name,
        metadataHash: metadataResult.IpfsHash,
        imageUrl: imageUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: `成功处理 ${metadataResults.length} 个NFT，未匹配图片 ${unmatched.length} 个`,
      results: metadataResults,
      unmatched,
    });
  } catch (error) {
    console.error("Batch upload error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "批量上传失败",
    });
  }
}
