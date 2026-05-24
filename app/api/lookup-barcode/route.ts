import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'No barcode provided' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await res.json();

    if (data.status === 1) {
      const product = data.product;
      const nutriments = product.nutriments || {};
      
      return NextResponse.json({
        name: product.product_name || 'Unknown Product',
        calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
        protein: nutriments.proteins_100g || nutriments.proteins || 0,
        carbs: nutriments.carbohydrates_100g || nutriments.carbohydrates || 0,
        fat: nutriments.fat_100g || nutriments.fat || 0,
      });
    } else {
       return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch OpenFoodFacts' }, { status: 500 });
  }
}
