import { Icon } from '@components';
import { TastedPour } from '../../../types';
import { ProductShot } from './ProductShot';
import {
  Card,
  Container,
  Empty,
  HeartOverlay,
  Info,
  InfoBottom,
  Label,
  List,
  PourBottle,
  Proof,
  Tag,
  TagText,
} from './styles';

type Props = {
  pours: TastedPour[];
};

export const PoursTonight = ({ pours }: Props) => (
  <Container>
    <Label>YOUR POURS TONIGHT</Label>
    {pours.length === 0 && (
      <Empty>Mark a bottle as tasted at any booth and it&apos;ll show up here.</Empty>
    )}
    {pours.length > 0 && (
      <List>
        {pours.map((pour) => (
          <Card key={`${pour.boothId}:${pour.id}`}>
            <ProductShot
              brand={pour.brand}
              image={pour.image}
              brandImage={pour.brandImage}
            />
            <Info>
              <PourBottle clearsHeart={pour.fav} numberOfLines={2}>
                {pour.name}
              </PourBottle>
              <InfoBottom>
                {Boolean(pour.proof) && <Proof>{pour.proof}</Proof>}
                <Tag>
                  <TagText numberOfLines={1}>{pour.tag}</TagText>
                </Tag>
              </InfoBottom>
            </Info>
            {pour.fav && (
              <HeartOverlay>
                <Icon name="heart" size={16} color="red" />
              </HeartOverlay>
            )}
          </Card>
        ))}
      </List>
    )}
  </Container>
);
