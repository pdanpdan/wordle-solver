<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="column no-wrap" style="width: 600px">
      <q-card-section style="background-color: rgba(0, 0, 0, .2)">
        <div class="text-h5 text-weight-bold">{{ $t('help.title') }}</div>
      </q-card-section>

      <q-card-section class="col scroll">
        <div class="text-h6 text-weight-bold q-mb-xs">{{ $t('help.instructions') }}</div>
        <div class="text-body2 q-my-sm">&raquo; {{ $t('help.instructions_1') }}</div>
        <div class="text-body2 q-my-sm">&raquo; {{ $t('help.instructions_2') }}</div>
        <div class="text-body2 q-my-sm">&raquo; {{ $t('help.instructions_3') }}</div>
        <div class="text-body2 q-my-sm">&raquo; {{ $t('help.instructions_4') }}</div>
        <div class="text-body2 q-my-sm">&raquo; {{ $t('help.instructions_5') }}</div>

        <div class="text-h6 text-weight-bold q-mt-md q-mb-xs">{{ $t('help.credits') }}</div>
        <div class="text-body2 q-my-sm">
          &raquo;
          <a class="text-primary" href="https://www.poirrier.ca/notes/wordle" target="_blank">
            Mathematical optimization over Wordle decision trees
          </a>
        </div>
        <div class="text-body2 q-my-sm">
          &raquo;
          <a class="text-primary" href="https://notfunatparties.substack.com/p/wordle-solver" target="_blank">
            Ruining the fun: a Wordle auto-solver
          </a>
        </div>

        <div class="text-h6 text-weight-bold q-mt-md q-mb-xs row items-center">
          {{ $t('help.source_code') }}

          <q-btn
            flat
            no-caps
            size="20px"
            padding="none sm"
            color="primary"
            label="GitHub Repo"
            href="https://github.com/pdanpdan/wordle-solver"
            target="_blank"
          />
        </div>
      </q-card-section>

      <q-card-actions style="background-color: rgba(0, 0, 0, .2)" align="right">
        <q-btn
          autofocus
          flat
          no-caps
          color="primary"
          :label="$t('help.btn_close')"
          @click="onCloseClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HelpComponent',

  emits: [
    'ok', 'hide',
  ],

  methods: {
    show() {
      this.$refs.dialog.show();
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      this.$emit('hide');
    },

    onCloseClick() {
      this.hide();
    },
  },
});
</script>
