import { Source } from 'callbag';

export default function wait<I>(delay: number): (source: Source<I>) => Source<I>;
