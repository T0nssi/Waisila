import type { APIRoute } from 'astro';
import { readJsonFile, writeJsonFile, getDataFile } from '../../../lib/apiHelpers';
import { getSession } from '../../../middleware/auth';

export const prerender = false;

const USE_MONGODB = !!process.env.MONGODB_URI;

// GET - list all testimonials
export const GET: APIRoute = async ({ cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

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
