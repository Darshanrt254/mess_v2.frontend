import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CustomerCard({ customer }) {
  if (!customer) return null;

  return (
    <Card className="hover:border-brand-darkGreen transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} size="md" />
          <div>
            <h4 className="font-black text-brand-darkGreen text-sm">{customer.name}</h4>
            <span className="text-xs font-bold text-brand-green flex items-center gap-1">
              <Phone className="w-3 h-3" /> {customer.phone}
            </span>
          </div>
        </div>
        <Badge
          variant={customer.status === 'Active' ? 'success' : 'warning'}
          size="sm"
        >
          {customer.status}
        </Badge>
      </div>

      <div className="mt-3 pt-3 border-t border-brand-orange/20 flex items-center justify-between text-xs font-bold">
        <span className="text-brand-green">{customer.plan}</span>
        <Link to={`/owner/customers/${customer.id}`}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View
          </Button>
        </Link>
      </div>
    </Card>
  );
}
