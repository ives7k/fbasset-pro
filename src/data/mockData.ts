import { Asset } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock data for assets
export const mockAssets: Asset[] = [
  {
    id: uuidv4(),
    name: 'company.com',
    type: 'domain',
    status: 'active',
    cost: 12.99,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 10)).toISOString(),
    tags: ['main', 'website'],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 14)).toISOString(),
    updatedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Facebook Page',
    type: 'social_media',
    status: 'active',
    cost: 0,
    expirationDate: '',
    tags: ['marketing', 'social'],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 24)).toISOString(),
    updatedAt: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Mobile App Pro License',
    type: 'application',
    status: 'expired',
    cost: 99.99,
    expirationDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    tags: ['development', 'license'],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString(),
    updatedAt: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString()
  },
  {
    id: uuidv4(),
    name: 'company-blog.com',
    type: 'domain',
    status: 'pending',
    cost: 9.99,
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    tags: ['blog', 'content'],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    updatedAt: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Premium Cloud Hosting',
    type: 'subscription',
    status: 'active',
    cost: 29.99,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    tags: ['hosting', 'infrastructure'],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 8)).toISOString(),
    updatedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString()
  },
  {
    id: uuidv4(),
    name: 'LinkedIn Premium',
    type: 'subscription',
    status: 'active',
    cost: 39.99,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    tags: ['recruiting', 'social'],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString(),
    updatedAt: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Design Software License',
    type: 'application',
    status: 'inactive',
    cost: 199.99,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
    tags: ['design', 'license'],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 18)).toISOString(),
    updatedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString()
  }
];