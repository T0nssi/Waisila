import type { APIRoute } from 'astro';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { getSession } from '../../../middleware/auth';

export const prerender = false;

const USE_MONGODB = !!process.env.MONGODB_URI;

// GET - list all testimonials
export const GET: APIRoute = async ({ cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (USE_MONGODB) {
    try {
      const collection = await getCollection(COLLECTIONS.TESTIMONIALS);
      const testimonials = await collection.find({}).toArray();
      return new Response(JSON.stringify(testimonials), { status: 200 });
    } catch (error) {
      console.error('MongoDB testimonials error:', error);
    }
  }

  // Fallback to JSON
  const { readJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
  const data = readJsonFile(getDataFile('testimonials.json'), { testimonials: [] });
  return new Response(JSON.stringify(data.testimonials || []), { status: 200 });
};

// POST - create testimonial
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();

    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.TESTIMONIALS);
      const newTestimonial = {
        id: 't_' + Date.now().toString(36),
        name: body.name || '',
        initial: body.initial || '',
        text: body.text || '',
        icon: body.icon || 'facebook',
        active: body.active !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await collection.insertOne(newTestimonial);
      return new Response(JSON.stringify(newTestimonial), { status: 201 });
    }

    // Fallback to JSON
    const { readJsonFile, writeJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
    const data = readJsonFile(getDataFile('testimonials.json'), { testimonials: [] });
    const newTestimonial = {
      id: 't_' + Date.now().toString(36),
      name: body.name || '',
      initial: body.initial || '',
      text: body.text || '',
      icon: body.icon || 'facebook',
      active: body.active !== false,
    };
    data.testimonials.push(newTestimonial);
    writeJsonFile(getDataFile('testimonials.json'), data);
    return new Response(JSON.stringify(newTestimonial), { status: 201 });

  } catch (error) {
    console.error('Testimonial POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create testimonial' }), { status: 500 });
  }
};

// PUT - update testimonial
export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();

    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.TESTIMONIALS);
      const existing = await collection.findOne({ id: body.id });
      if (!existing) {
        return new Response(JSON.stringify({ error: 'Testimonial not found' }), { status: 404 });
      }
      const updated = { ...existing, ...body, updatedAt: new Date() };
      await collection.updateOne({ id: body.id }, { $set: updated });
      return new Response(JSON.stringify(updated), { status: 200 });
    }

    // Fallback to JSON
    const { readJsonFile, writeJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
    const data = readJsonFile(getDataFile('testimonials.json'), { testimonials: [] });
    const index = data.testimonials.findIndex((t: any) => t.id === body.id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Testimonial not found' }), { status: 404 });
    }
    data.testimonials[index] = { ...data.testimonials[index], ...body };
    writeJsonFile(getDataFile('testimonials.json'), data);
    return new Response(JSON.stringify(data.testimonials[index]), { status: 200 });

  } catch (error) {
    console.error('Testimonial PUT error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update testimonial' }), { status: 500 });
  }
};

// DELETE - delete testimonial
export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.TESTIMONIALS);
      const result = await collection.deleteOne({ id });
      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: 'Testimonial not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Fallback to JSON
    const { readJsonFile, writeJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
    const data = readJsonFile(getDataFile('testimonials.json'), { testimonials: [] });
    const index = data.testimonials.findIndex((t: any) => t.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Testimonial not found' }), { status: 404 });
    }
    data.testimonials.splice(index, 1);
    writeJsonFile(getDataFile('testimonials.json'), data);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Testimonial DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete testimonial' }), { status: 500 });
  }
};
