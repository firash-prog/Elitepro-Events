import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { GoogleGenAI } from '@google/genai';

interface PortfolioItem {
  image: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
})
export class PortfolioComponent implements OnInit {
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  private meta = inject(Meta);
  private title = inject(Title);
  
  portfolioItems = signal<PortfolioItem[]>([
    {
      image: '',
      category: 'Corporate Launch',
      title: 'Project Nebula',
      description: 'A stellar product launch event for a new-age tech giant.',
      prompt: "A photorealistic, high-resolution image of a futuristic corporate product launch stage for 'Project Nebula'. The stage is dark with neon blue and purple lights, featuring a large holographic projection of a galaxy. On a sleek, minimalist pedestal, a new high-tech gadget is displayed, glowing softly. The audience is silhouetted in the foreground."
    },
    {
      image: '',
      category: 'Tech Conference',
      title: 'Cybernetic Horizons',
      description: 'The future of AI and robotics displayed in an immersive conference.',
      prompt: "A professional, wide-angle photograph of a bustling tech conference hall, 'Cybernetic Horizons'. Attendees interact with advanced robots and large, transparent touchscreen displays. The architecture is modern and geometric, with green and silver lighting. The atmosphere is innovative and collaborative."
    },
    {
      image: '',
      category: 'Gala Dinner',
      title: 'Aurora Ball',
      description: 'An elegant evening of celebration under a canopy of digital stars.',
      prompt: "An elegant, high-resolution photograph of a futuristic gala dinner, the 'Aurora Ball'. Guests in formal attire are seated at tables under a massive, shimmering digital ceiling projection that mimics the aurora borealis. Floating orbs of light provide ambient illumination. The mood is sophisticated and magical."
    },
    {
      image: '',
      category: 'Music Festival',
      title: 'Synthwave Spectacle',
      description: 'A vibrant music festival blending retro aesthetics with futuristic soundscapes.',
       prompt: "A vibrant, dynamic, high-resolution photo from the crowd's perspective at an outdoor music festival, the 'Synthwave Spectacle'. The stage is a massive geometric structure with retro-futuristic neon grids in pink, cyan, and orange. Lasers cut through the night sky. A DJ is visible on stage, and the crowd is energetic and dancing."
    },
     {
      image: '',
      category: 'Brand Activation',
      title: 'Quantum Leap',
      description: 'An interactive brand experience that bent the rules of reality.',
      prompt: "A mind-bending, high-resolution photo of an interactive brand activation called 'Quantum Leap'. People are walking through a tunnel of swirling light and abstract geometric patterns. The environment feels surreal and immersive, blending physical structures with augmented reality projections. The colors are vivid and constantly shifting."
    },
    {
      image: '',
      category: 'Art Installation',
      title: 'Digital Dreams',
      description: 'A public art installation that brought collective dreams to life through light.',
      prompt: "A beautiful, high-resolution photograph of an outdoor, large-scale digital art installation at night. Titled 'Digital Dreams', it consists of thousands of LED lights forming flowing, abstract shapes that resemble a dreamscape. People are walking around and under the installation, looking up in awe. The scene is serene and awe-inspiring."
    }
  ]);

  ngOnInit(): void {
    this.generatePortfolioImages();
  }

  retryImageGeneration(): void {
    this.generatePortfolioImages();
  }

  setMetaTags(item: PortfolioItem): void {
    const pageTitle = `ElitePro | ${item.title}`;
    this.title.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: item.description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: item.description });
    this.meta.updateTag({ property: 'og:image', content: item.image });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: item.description });
    this.meta.updateTag({ name: 'twitter:image', content: item.image });
  }

  private async generatePortfolioImages(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    
    if (!process.env.API_KEY) {
      this.error.set('API key is not set. Please configure your environment.');
      this.loading.set(false);
      return;
    }
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const updatedItems: PortfolioItem[] = [];

      for (const item of this.portfolioItems()) {
        const imageUrl = await this.generateImageWithRetry(ai, item.prompt);
        updatedItems.push({ ...item, image: imageUrl });
      }
      
      this.portfolioItems.set(updatedItems);

    } catch (e: unknown) {
      console.error(e);
      let errorMessage = 'An unknown error occurred. Please try again later.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string') {
        errorMessage = e.message;
      }
      this.error.set(`Image generation failed: ${errorMessage}`);
    } finally {
      this.loading.set(false);
    }
  }

  private async generateImageWithRetry(ai: GoogleGenAI, prompt: string, retries = 3, delay = 2000): Promise<string> {
    let lastError: unknown;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '4:3',
          },
        });
        return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
      } catch (e) {
        lastError = e;
        console.warn(`Attempt ${i + 1} for image generation failed. Retrying in ${delay / 1000}s...`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}